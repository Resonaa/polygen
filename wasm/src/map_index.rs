//! Basic indexing methods for [`Map`].

use crate::{
    land::{
        Land, LandProperties,
        Type::{Mountain, Obstacle},
    },
    map::{
        Map,
        Mode::{Hexagon, Square},
    },
    pos::{Index, Pos, ToIndex, ToPos},
};
use std::{ops, slice};

impl ops::Index<Index> for Map {
    type Output = Land;

    #[inline]
    fn index(&self, index: Index) -> &Self::Output {
        // Safety: Bounds checking should be done by `Map::check`.
        unsafe { self.lands.get_unchecked(index) }
    }
}

impl ops::IndexMut<Index> for Map {
    #[inline]
    fn index_mut(&mut self, index: Index) -> &mut Self::Output {
        // Safety: Bounds checking should be done by `Map::check`.
        unsafe { self.lands.get_unchecked_mut(index) }
    }
}

/// Helper macro to create dir arrays.
macro_rules! dir {
    [$($pos: expr),*] => {
        [$(Pos::from_array($pos)),*]
    };
}

// !0 => -1

static DIR_HEXAGON_ODD_COLUMNS: [Pos; 6] = dir![[0, !0], [!0, 0], [0, 1], [1, 1], [1, 0], [1, !0]];

static DIR_HEXAGON_EVEN_COLUMNS: [Pos; 6] =
    dir![[!0, !0], [!0, 0], [!0, 1], [0, 1], [1, 0], [0, !0]];

static DIR_SQUARE: [Pos; 4] = dir![[1, 0], [0, 1], [!0, 0], [0, !0]];

impl Map {
    /// Checks whether the [`Pos`] is in the [`Map`].
    #[inline]
    pub fn check_pos(&self, pos: Pos) -> bool {
        pos[0] < self.height && pos[1] < self.width
    }

    /// Tests whether the [`Index`] is accessible.
    #[inline]
    pub fn access(&self, index: Index) -> bool {
        !matches!(self[index].get_type(), Mountain | Obstacle)
    }

    /// Gets the dir slice of the given [`Index`].
    pub fn dir(&self, index: Index) -> &[Pos] {
        match self.mode {
            Hexagon => {
                let y = index.to_pos(self.width)[1];

                if (y & 1) == 0 {
                    DIR_HEXAGON_EVEN_COLUMNS.as_slice()
                } else {
                    DIR_HEXAGON_ODD_COLUMNS.as_slice()
                }
            }
            Square => DIR_SQUARE.as_slice(),
        }
    }

    /// Gets **accessible** neighbors of the [`Index`].
    pub fn neighbors(&self, index: Index) -> Vec<Index> {
        let pos = index.to_pos(self.width);

        self.dir(index)
            .iter()
            .map(|&delta| pos + delta)
            .filter(|&pos| self.check_pos(pos))
            .map(|pos| pos.to_index(self.width))
            .filter(|&index| self.access(index))
            .collect()
    }
}

impl<'a> IntoIterator for &'a Map {
    type Item = &'a Land;
    type IntoIter = slice::Iter<'a, Land>;

    #[inline]
    fn into_iter(self) -> Self::IntoIter {
        self.lands.iter()
    }
}
