//! Provides convenient methods to create a [`crate::map::Map`] for testing purpose.
//!
//! This module also re-exports some frequently-used items.

pub use crate::land::*;
pub use crate::map::*;
pub use crate::map_view::*;
pub use crate::pos::*;
pub use crate::{lands, square};

/// Helper macro to construct [`Map::lands`].
///
/// Uses the following shorthands:
///
/// - `_` for [`Type::Land`].
/// - `#` for [`Type::Mountain`].
/// - `C` for [`Type::City`].
/// - `G` for [`Type::Crown`].
/// - `O` for [`Type::Obstacle`].
/// - `F` for [`Type::Fog`].
/// - `S` for [`Type::Swamp`].
#[macro_export]
macro_rules! lands {
    // Matches a single `_`.
    (> _) => {
        Land::new(Type::Land, 0, 0)
    };

    // Matches a single `#`.
    (> #) => {
        Land::new(Type::Mountain, 0, 0)
    };

    // Matches a single `C`.
    (> C) => {
        Land::new(Type::City, 0, 0)
    };

    // Matches a single `G`.
    (> G) => {
        Land::new(Type::Crown, 0, 0)
    };

    // Matches a single `O`.
    (> O) => {
        Land::new(Type::Obstacle, 0, 0)
    };

    // Matches a single `F`.
    (> F) => {
        Land::new(Type::Fog, 0, 0)
    };

    // Matches a single `S`.
    (> S) => {
        Land::new(Type::Swamp, 0, 0)
    };

    // Entry pattern.
    [$($land: tt)*] => {
        vec![$(lands!(> $land)),*]
    }
}

/// A more convenient macro to create a N * N [`Map`] with [`Mode::Square`].
#[macro_export]
macro_rules! square {
    [$($land: tt)*] => {
        {
            let vec = vec![$(lands!(> $land)),*];
            let size = (vec.len() as f64).sqrt() as usize;

            Map::with_lands(Mode::Square, size, size, vec)
        }
    };
}

/// Tests the [`lands`] macro.
#[cfg(test)]
#[test]
fn it_creates_lands() {
    let land = Land::new(Type::Land, 0, 0);
    let mountain = Land::new(Type::Mountain, 0, 0);
    let city = Land::new(Type::City, 0, 0);
    let crown = Land::new(Type::Crown, 0, 0);
    let obstacle = Land::new(Type::Obstacle, 0, 0);
    let fog = Land::new(Type::Fog, 0, 0);
    let swamp = Land::new(Type::Swamp, 0, 0);

    let array = vec![land, mountain, city, crown, obstacle, fog, swamp];

    assert_eq!(lands![_ # C G O F S], array);
}

/// Tests the [`square`] macro.
#[cfg(test)]
#[test]
fn it_creates_square_map() {
    let map = square![
        _ _ _
        _ # _
        _ _ _
    ];

    assert_eq!(map.width, 3);
    assert_eq!(map.height, 3);
    assert_eq!(map.mode, Mode::Square);
}
