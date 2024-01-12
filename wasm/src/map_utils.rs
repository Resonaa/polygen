//! High-level map utilities including distancing.

use crate::land::{LandProperties, Type::City};
use crate::{map::Map, pos::Index};
use highway::HighwayHasher;
use std::collections::{HashSet, VecDeque};
use std::hash::BuildHasherDefault;
use std::ops::RangeInclusive;

impl Map {
    /// Calculates the distance between two [`Index`]s.
    ///
    /// If you want a quick check instead of an accurate value, see [`Map::require_dist`].
    ///
    /// With `strict` set to `true`, the path cannot pass cities.
    ///
    /// Returns [`None`] if the path is not found.
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
    pub fn require_dist(
        &self,
        from: Index,
        to: Index,
        range: RangeInclusive<Index>,
        strict: bool,
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
