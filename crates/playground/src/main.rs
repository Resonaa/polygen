use generator::generate;
use model::types::GMMode;
use model::{GMConfig, GMName, GMProfile};

fn main() {
  let player_count = 2;
  let mode = GMMode::Square;
  let width = 0.;
  let height = 0.;
  let city_density = 0.5;
  let y_ratio = 0.5;
  let name = GMName::PureRandom;

  let config = GMConfig { player_count, mode, width, height, y_ratio, city_density };
  let profile = GMProfile { name, config };
  let (gm, rp) = generate(profile);

  // dbg!(gm);
  // dbg!(rp);
}
