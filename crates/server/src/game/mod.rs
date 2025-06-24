mod room;

use std::sync::Arc;

use dashmap::DashMap;
use model::types::{LandColor, TeamId};
use room::{MinifiedRoom, Room};
use serde::Deserialize;
use socketioxide::extract::{Data, SocketRef, State};
use socketioxide::socket::Sid;
use tracing::info;

use crate::game::room::Player;

pub type RoomPool = DashMap<String, Room>;

#[derive(Clone, Default)]
pub struct RoomPoolStore {
  pool: Arc<RoomPool>
}

pub type RoomPoolState = State<RoomPoolStore>;

impl RoomPoolStore {
  pub async fn serialize(&self) -> Vec<MinifiedRoom> {
    self.pool.iter().map(|room| room.minify()).collect()
  }

  pub async fn add_player(&self, sid: Sid, room_name: &str, username: &str) -> Room {
    let mut room = self
      .pool
      .entry(room_name.to_string())
      .or_insert_with(|| Room { name: room_name.to_owned(), ..Default::default() });

    let mut new_player = Player { username: username.to_string(), sid, ..Default::default() };

    for i in 1..=room.players.len() as LandColor + 1 {
      if !room.players.iter().any(|x| x.color == i) {
        new_player.color = i;
        break;
      }
    }

    for i in 1..=room.players.len() as TeamId + 1 {
      if !room.players.iter().any(|x| x.team == i) {
        new_player.team = i;
        break;
      }
    }

    room.players.push(new_player.clone());

    room.clone()
  }

  pub async fn remove_player(&self, sid: Sid) {
    for mut room in self.pool.iter_mut() {
      for i in 0..room.players.len() {
        if room.players[i].sid == sid {
          room.players.remove(i);
          return;
        }
      }
    }
  }
}

pub async fn handle_connection(socket: SocketRef, room_pool: State<RoomPoolStore>) {
  #[derive(Deserialize)]
  struct QueryParams<'a> {
    #[serde(default = "anonymous_username")]
    username: &'a str,
    #[serde(default = "root_room")]
    room: &'a str
  }

  const fn anonymous_username() -> &'static str { "Anonymous" }
  const fn root_room() -> &'static str { "/" }

  info!("socket connected: {}", socket.id);

  let params: Option<QueryParams> = socket
    .req_parts()
    .uri
    .path_and_query()
    .and_then(|q| q.query())
    .and_then(|q| serde_querystring::from_str(q, serde_querystring::ParseMode::UrlEncoded).ok());

  let (username, room_name) = match params {
    Some(QueryParams { username, room }) => (username.to_string(), room.to_string()),
    None => {
      socket.disconnect().ok();
      return;
    }
  };

  {
    let room = room_pool.add_player(socket.id, &room_name, &username).await;
    socket.join(room_name.clone());
    socket.within(room_name.clone()).emit("room_update", &room).await.ok();
  }

  info!("{} joined {}.", username, room_name);

  socket.on("get_room_list", |socket: SocketRef, room_pool: RoomPoolState| async move {
    socket.emit("room_list", &room_pool.serialize().await).ok();
  });

  socket.on(
    "chat",
    |socket: SocketRef, Data::<String>(msg): Data<String>, _: RoomPoolState| async move {
      socket.within(room_name.clone()).emit("chat", &(username, msg)).await.ok();
    }
  );

  socket.on_disconnect(|socket: SocketRef, room_pool: RoomPoolState| async move {
    room_pool.remove_player(socket.id).await;
  });
}
