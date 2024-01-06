use crate::{
    map::Map,
    pos::{Index, ToIndex, ToPos},
};
use log::debug;
use wasm_bindgen::prelude::wasm_bindgen;

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Map {
    /// Gets the neighbors of the index.
    pub fn neighbors(&self, index: Index) -> Vec<Index> {
        let (x, y) = index.to_pos(self.width);
        debug!("{x}, {y}");

        self.dir(index)
            .iter()
            .map(|&(dx, dy)| (x as i16 + dx, y as i16 + dy))
            .filter(|&pos| self.check_pos(pos))
            .map(|(x, y)| (x as u8, y as u8).to_index(self.width))
            .filter(|&index| self.access(index))
            .collect()
    }
}
