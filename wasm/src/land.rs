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

    fn new(r#type: Type, color: u8, amount: u32) -> Self
    where
        Self: Default,
    {
        let mut land: Self = Default::default();

        land.set_type(r#type);
        land.set_color(color);
        land.set_amount(amount);

        land
    }
}

impl LandProperties for Land {
    #[inline]
    fn get_type(&self) -> Type {
        ((self >> 29) as u8).into()
    }

    #[inline]
    fn set_type(&mut self, new_type: Type) {
        *self &= 0b0111_1111_1111_1111_1111_1111_1111;
        *self |= (new_type as u32) << 29;
    }

    #[inline]
    fn get_color(&self) -> u8 {
        ((self >> 24) & 0b0001_1111) as u8
    }

    #[inline]
    fn set_color(&mut self, new_color: u8) {
        *self &= 0b1110_0000_1111_1111_1111_1111_1111;
        *self |= (new_color as u32) << 24;
    }

    #[inline]
    fn get_amount(&self) -> u32 {
        self & 0b0000_0000_1111_1111_1111_1111_1111
    }

    #[inline]
    fn set_amount(&mut self, new_amount: u32) {
        *self &= 0b1111_1111_0000_0000_0000_0000_0000;
        *self |= new_amount;
    }
}
