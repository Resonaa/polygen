use crate::{
    map::Map,
    pos::{Index, ToIndex, ToPos},
};
use wasm_bindgen::prelude::wasm_bindgen;

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Map {
    /// Gets the neighbors of the [`Index`].
    pub fn neighbors(&self, index: Index) -> Vec<Index> {
        let (x, y) = index.to_pos(self.width);

        self.dir(index)
            .iter()
            .map(|&(dx, dy)| (x as i32 + dx, y as i32 + dy))
            .filter(|&pos| self.check_pos(pos))
            .map(|(x, y)| (x as usize, y as usize).to_index(self.width))
            .filter(|&index| self.access(index))
            .collect()
    }
}
