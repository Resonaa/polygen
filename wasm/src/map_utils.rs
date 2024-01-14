//! High-level map utilities including distancing.

use std::collections::{HashSet, VecDeque};
use std::hash::BuildHasherDefault;
use std::ops::RangeInclusive;

use highway::HighwayHasher;

use crate::land::LandProperties;
use crate::land::Type::City;
use crate::map::Map;
use crate::pos::Index;

impl Map {
    /// Calculates the distance between two [`Index`]s.
    ///
    /// If you want a quick check instead of an accurate value, see [`Map::require_dist`].
    ///
    /// With `strict` set to `true`, the path cannot pass cities.
    ///
    /// Returns [`None`] if the path is not found.
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    ///
    /// let map = square![
    ///     _ # _ _
    ///     _ C _ _
    ///     _ # _ _
    ///     _ _ _ _
    /// ];
    ///
    /// assert_eq!(map.dist(0, 2, false), Some(4));
    /// assert_eq!(map.dist(0, 2, true), Some(8));
    /// assert_eq!(map.dist(1, 3, false), None);
    /// ```
    pub fn dist(&self, from: Index, to: Index, strict: bool) -> Option<usize> {
        let mut vis = HashSet::with_hasher(BuildHasherDefault::<HighwayHasher>::default());

        vis.insert(from);

        let mut q = VecDeque::from([(from, 0)]);

        while let Some((pos, dist)) = q.pop_front() {
            if pos == to {
                return Some(dist);
            }

            for next in self.neighbors(pos) {
                if (!strict || self[next].get_type() != City) && vis.insert(next) {
                    q.push_back((next, dist + 1));
                }
            }
        }

        None
    }

    /// Tests whether the distance between two [`Index`]s meets the requirement.
    ///
    /// It's recommended to use this function instead of [`Map::dist`] if you just want to
    /// enforce some distance constraints, for it tends to resolve in a shorter time.
    ///
    /// With `strict` set to `true`, the path cannot pass cities.
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    ///
    ///  let map = square![
    ///     _ # _ _
    ///     _ C _ _
    ///     _ # _ _
    ///     _ _ _ _
    ///  ];
    ///
    ///
    /// assert_eq!(map.require_dist(0, 2, 1..=4, false), true);
    /// assert_eq!(map.require_dist(0, 2, 1..=4, true), false);
    /// ```
    pub fn require_dist(
        &self,
        from: Index,
        to: Index,
        range: RangeInclusive<Index>,
        strict: bool
    ) -> bool {
        let mut vis = HashSet::with_hasher(BuildHasherDefault::<HighwayHasher>::default());

        vis.insert(from);

        let mut q = VecDeque::from([(from, 0)]);

        while let Some((pos, dist)) = q.pop_front() {
            if pos == to {
                return range.contains(&dist);
            }

            if dist > *range.end() {
                return false;
            }

            for next in self.neighbors(pos) {
                if (!strict || self[next].get_type() != City) && vis.insert(next) {
                    q.push_back((next, dist + 1));
                }
            }
        }

        false
    }
}
