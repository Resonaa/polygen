use model::{GM, GMConfig, RP};
use serde::Serialize;

mod player;

pub use player::{MinifiedPlayer, Player};

#[derive(Clone, Serialize, Debug, Default)]
pub struct Room {
  pub name: String,
  pub config: GMConfig,
  pub game_started: bool,
  pub players: Vec<Player>,
  pub gm: Option<GM>,
  pub rp: Option<RP>
}

#[derive(Serialize)]
pub struct MinifiedRoom {
  pub name: String,
  pub config: GMConfig,
  pub game_started: bool,
  pub players: Vec<Player>
}

impl Room {
  pub fn minify(&self) -> MinifiedRoom {
    MinifiedRoom {
      name: self.name.clone(),
      config: self.config.clone(),
      game_started: self.game_started,
      players: self.players.clone()
    }
  }
}
