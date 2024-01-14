//! Viewing and masking support for [`crate::land::Land`] and [`crate::map::Map`].

use bitvec::order::Lsb0;
use bitvec::vec::BitVec;

use crate::land::Type::{City, Fog, Mountain, Obstacle};
use crate::land::{Land, LandProperties};

/// Map mask.
pub type Mask = BitVec<usize, Lsb0>;

/// Helper trait to mask a [`Land`].
pub trait MaskLand {
    /// Masks the given [`Land`].
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

    /// Masks and assigns to the given [`Land`].
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
    fn mask_assign(&mut self)
    where
        Self: Sized
    {
        *self = self.mask();
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
