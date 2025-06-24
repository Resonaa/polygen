use model::types::{LandColor, TeamId};
use serde::Serialize;
use socketioxide::socket::Sid;

#[derive(Serialize, Clone, Default, PartialEq, Debug)]
pub struct Player {
  pub username: String,
  pub sid: Sid,
  pub color: LandColor,
  pub team: TeamId,
  pub start: bool,
  pub spectate: bool,
  pub dead: bool
}

#[derive(Serialize, Default)]
pub struct MinifiedPlayer {
  username: String,
  color: LandColor
}

impl Player {
  pub fn minify(&self) -> MinifiedPlayer {
    MinifiedPlayer { username: self.username.clone(), color: self.color }
  }
}
