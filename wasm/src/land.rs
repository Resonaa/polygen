use std::mem;

/// Land types.
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
#[repr(u8)]
pub enum Type {
    #[default]
    Land,
    Crown,
    City,
    Mountain,
    Obstacle,
    Fog,
    Swamp,
}

impl From<u8> for Type {
    /// Converts [`u8`] to [`Type`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::land::Type;
    ///
    /// let converted: Type = 1.into();
    /// assert_eq!(converted, Type::Crown);
    /// ```
    #[inline]
    fn from(value: u8) -> Self {
        unsafe { mem::transmute(value) }
    }
}

/// Map Land.
///
/// # Layout
///
/// Bits     0        3         8          32
///          +--------+---------+----------+
/// Layout   |  Type  |  Color  |  Amount  |
///          +--------+---------+----------+
pub type Land = u32;

/// Helper trait to manipulate [`Land`] properties.
pub trait LandProperties {
    fn get_type(&self) -> Type;
    fn set_type(&mut self, new_type: Type);

    fn get_color(&self) -> u8;
    fn set_color(&mut self, new_color: u8);

    fn get_amount(&self) -> u32;
    fn set_amount(&mut self, new_amount: u32);

    fn new(r#type: Type, color: u8, amount: u32) -> Self;
}

impl LandProperties for Land {
    /// Gets the [`Type`] of the [`Land`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::land::{Land, LandProperties, Type};
    ///
    /// let land = Land::new(Type::Swamp, 0, 0);
    /// assert_eq!(land.get_type(), Type::Swamp);
    /// ```
    #[inline]
    fn get_type(&self) -> Type {
        ((self >> 29) as u8).into()
    }

    /// Sets the [`Type`] of the [`Land`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::land::{Land, LandProperties, Type};
    ///
    /// let mut land = Land::new(Type::Swamp, 0, 0);
    /// land.set_type(Type::Mountain);
    /// assert_eq!(land.get_type(), Type::Mountain);
    /// ```
    #[inline]
    fn set_type(&mut self, new_type: Type) {
        *self &= 0b0001_1111_1111_1111_1111_1111_1111_1111;
        *self |= (new_type as u32) << 29;
    }

    /// Gets the color of the [`Land`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::land::{Land, LandProperties, Type};
    ///
    /// let land = Land::new(Type::Land, 18, 0);
    /// assert_eq!(land.get_color(), 18);
    /// ```
    #[inline]
    fn get_color(&self) -> u8 {
        ((self >> 24) & 0b0001_1111) as u8
    }

    /// Sets the color of the [`Land`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::land::{Land, LandProperties, Type};
    ///
    /// let mut land = Land::new(Type::Land, 4, 0);
    /// land.set_color(18);
    /// assert_eq!(land.get_color(), 18);
    /// ```
    #[inline]
    fn set_color(&mut self, new_color: u8) {
        *self &= 0b1110_0000_1111_1111_1111_1111_1111_1111;
        *self |= (new_color as u32) << 24;
    }

    /// Gets the amount of the [`Land`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::land::{Land, LandProperties, Type};
    ///
    /// let land = Land::new(Type::Land, 0, 161);
    /// assert_eq!(land.get_amount(), 161);
    /// ```
    #[inline]
    fn get_amount(&self) -> u32 {
        self & 0b0000_0000_1111_1111_1111_1111_1111_1111
    }

    /// Sets the amount of the [`Land`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::land::{Land, LandProperties, Type};
    ///
    /// let mut land = Land::new(Type::Land, 0, 161);
    /// land.set_amount(1606);
    /// assert_eq!(land.get_amount(), 1606);
    /// ```
    #[inline]
    fn set_amount(&mut self, new_amount: u32) {
        *self &= 0b1111_1111_0000_0000_0000_0000_0000_0000;
        *self |= new_amount;
    }

    /// Creates a new [`Land`].
    ///
    /// # Example
    ///
    /// ```rust
    /// use wasm::land::{Land, LandProperties, Type};
    ///
    /// let land = Land::new(Type::Crown, 2, 3);
    /// assert_eq!(land, 0b0010_0010_0000_0000_0000_0000_0000_0011);
    /// ```
    #[inline]
    fn new(r#type: Type, color: u8, amount: u32) -> Self {
        amount + ((color as u32) << 24) + ((r#type as u32) << 29)
    }
}
