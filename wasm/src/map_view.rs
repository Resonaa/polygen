//! Viewing and masking support for [`crate::land::Land`] and [`crate::map::Map`].

use bitvec::order::Lsb0;
use bitvec::vec::BitVec;

use crate::land::Type::{City, Fog, Mountain, Obstacle};
use crate::land::{Land, LandProperties};
use crate::map::Map;

/// [`Map`] mask.
///
/// The bits are stored in the same order as [`Map::lands`], 1 for masked and 0 for unmasked.
pub type Mask = BitVec<usize, Lsb0>;

/// Helper trait to mask a [`Land`].
pub trait MaskLand: LandProperties {
    /// Returns the masked version of the [`Land`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    ///
    /// let land = Land::new(Type::City, 1, 2);
    /// let masked = Land::new(Type::Obstacle, 0, 0);
    ///
    /// assert_eq!(land.mask(), masked);
    /// ```
    fn mask(&self) -> Self;

    /// Masks the [`Land`] in place.
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    ///
    /// let mut land = Land::new(Type::City, 1, 2);
    /// let masked = Land::new(Type::Obstacle, 0, 0);
    ///
    /// land.mask_assign();
    ///
    /// assert_eq!(land, masked);
    /// ```
    #[inline]
    fn mask_assign(&mut self) {
        *self = self.mask();
    }

    /// Whether a player in the given color owns the [`Land`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    ///
    /// let land = Land::new(Type::City, 1, 2);
    ///
    /// assert!(land.owned_by(1));
    /// assert!(!land.owned_by(2));
    /// ```
    #[inline]
    fn owned_by(&self, color: u8) -> bool {
        self.get_color() == color
    }

    /// Returns the view of the [`Land`] from the given color.
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    ///
    /// let land = Land::new(Type::City, 1, 2);
    /// let masked = Land::new(Type::Obstacle, 0, 0);
    ///
    /// assert_eq!(land.view(1), land);
    /// assert_eq!(land.view(10), masked);
    /// ```
    #[inline]
    fn view(&self, color: u8) -> Self {
        if self.owned_by(color) {
            *self
        } else {
            self.mask()
        }
    }

    /// Views the [`Land`] in place from the given color.
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    ///
    /// let original = Land::new(Type::City, 1, 2);
    /// let masked = Land::new(Type::Obstacle, 0, 0);
    ///
    /// let mut land = original;
    ///
    /// land.view_assign(1);
    /// assert_eq!(land, original);
    ///
    /// land.view_assign(2);
    /// assert_eq!(land, masked);
    /// ```
    #[inline]
    fn view_assign(&mut self, color: u8) {
        *self = self.view(color);
    }
}

impl MaskLand for Land {
    #[inline]
    fn mask(&self) -> Self {
        match self.get_type() {
            Mountain | City => Self::new(Obstacle, 0, 0),
            _ => Self::new(Fog, 0, 0)
        }
    }
}

impl Map {
    /// Creates a [`Mask`] of the [`Map`] with the color.
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    /// use bitvec::prelude::*;
    ///
    /// let mut map = Map::new(Mode::Hexagon, 1, 2);
    /// map[0].set_color(1);
    ///
    /// let mask = map.create_mask(1);
    /// assert_eq!(mask, bitvec![0, 1]);
    /// ```
    pub fn create_mask(&self, color: u8) -> Mask {
        self.lands.iter().map(|map| !map.owned_by(color)).collect()
    }

    /// Applies the [`Mask`] to the [`Map`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::map_testing::*;
    /// use bitvec::prelude::*;
    ///
    /// let mut map = Map::new(Mode::Hexagon, 1, 2);
    /// map[0].set_color(1);
    ///
    /// let should_not_mask = map[0];
    /// let should_mask = map[1].mask();
    ///
    /// let mask = map.create_mask(1);
    /// map.apply_mask(&mask);
    ///
    /// assert_eq!(map.lands, vec![should_not_mask, should_mask]);
    /// ```
    pub fn apply_mask(&mut self, mask: &Mask) {
        self.lands
            .iter_mut()
            .zip(mask.iter())
            .for_each(|(land, mask)| {
                if *mask {
                    land.mask_assign();
                }
            });
    }
}
