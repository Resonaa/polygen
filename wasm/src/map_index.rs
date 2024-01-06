use crate::{
    land::{
        Land,
        Type::{Mountain, Obstacle},
    },
    map::{
        Map,
        Mode::{Hexagon, Square},
    },
    pos::{Index, Pos, ToIndex, ToPos},
};
use std::ops;

impl ops::Index<Index> for Map {
    type Output = Land;

    fn index(&self, index: Index) -> &Self::Output {
        // Safety: Bounds checking should be done by `Map::check`.
        unsafe { self.lands.get_unchecked(index) }
    }
}

impl ops::IndexMut<Index> for Map {
    fn index_mut(&mut self, index: Index) -> &mut Self::Output {
        // Safety: Bounds checking should be done by `Map::check`.
        unsafe { self.lands.get_unchecked_mut(index) }
    }
}

impl ops::Index<Pos> for Map {
    type Output = Land;

    fn index(&self, pos: Pos) -> &Self::Output {
        &self[pos.to_index(self.width)]
    }
}

impl ops::IndexMut<Pos> for Map {
    fn index_mut(&mut self, pos: Pos) -> &mut Self::Output {
        let index = pos.to_index(self.width);
        &mut self[index]
    }
}

type DirItem = (i32, i32);

static DIR_HEXAGON_ODD_COLUMNS: [DirItem; 6] = [(0, -1), (-1, 0), (0, 1), (1, 1), (1, 0), (1, -1)];

static DIR_HEXAGON_EVEN_COLUMNS: [DirItem; 6] =
    [(-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 0), (0, -1)];

static DIR_SQUARE: [DirItem; 4] = [(1, 0), (0, 1), (-1, 0), (0, -1)];

impl Map {
    /// Checks whether the position is in the `Map`.
    pub fn check_pos(&self, (x, y): DirItem) -> bool {
        x >= 0 && (x as usize) < self.height && y >= 0 && (y as usize) < self.width
    }

    /// Tests whether the index is accessible.
    pub fn access(&self, index: Index) -> bool {
        !matches!(self[index].r#type, Mountain | Obstacle)
    }

    /// Gets the dir array of the given index.
    pub fn dir(&self, index: Index) -> &[DirItem] {
        match self.mode {
            Hexagon => {
                let (_, y) = index.to_pos(self.width);

                if (y & 1) == 0 {
                    DIR_HEXAGON_EVEN_COLUMNS.as_slice()
                } else {
                    DIR_HEXAGON_ODD_COLUMNS.as_slice()
                }
            }
            Square => DIR_SQUARE.as_slice(),
        }
    }
}
