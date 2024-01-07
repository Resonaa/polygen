use crate::{
    land::{
        Land,
        Type::{Mountain, Obstacle}, LandProperties,
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

impl ops::Index<Pos> for Map {
    type Output = Land;

    #[inline]
    fn index(&self, pos: Pos) -> &Self::Output {
        &self[pos.to_index(self.width)]
    }
}

impl ops::IndexMut<Pos> for Map {
    #[inline]
    fn index_mut(&mut self, pos: Pos) -> &mut Self::Output {
        let index = pos.to_index(self.width);
        &mut self[index]
    }
}

/// (dx, dy) for [`Pos`].
type DirItem = (i32, i32);

static DIR_HEXAGON_ODD_COLUMNS: [DirItem; 6] = [(0, -1), (-1, 0), (0, 1), (1, 1), (1, 0), (1, -1)];

static DIR_HEXAGON_EVEN_COLUMNS: [DirItem; 6] =
    [(-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 0), (0, -1)];

static DIR_SQUARE: [DirItem; 4] = [(1, 0), (0, 1), (-1, 0), (0, -1)];

impl Map {
    /// Checks whether the position is in the [`Map`].
    #[inline]
    pub fn check_pos(&self, (x, y): DirItem) -> bool {
        x >= 0 && (x as usize) < self.height && y >= 0 && (y as usize) < self.width
    }

    /// Tests whether the [`Index`] is accessible.
    #[inline]
    pub fn access(&self, index: Index) -> bool {
        !matches!(self[index].get_type(), Mountain | Obstacle)
    }

    /// Gets the [`DirItem`] slice of the given [`Index`].
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

impl<'a> IntoIterator for &'a Map {
    type Item = &'a Land;
    type IntoIter = slice::Iter<'a, Land>;

    #[inline]
    fn into_iter(self) -> Self::IntoIter {
        self.lands.iter()
    }
}
