#[repr(u8)]
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
/// Land types.
pub enum Type {
    #[default]
    Land,
    Crown,
    City,
    Mountain,
    Obstacle,
    Swamp,
}

#[repr(packed)]
#[derive(Clone, Copy, PartialEq, Eq, Debug, Default)]
/// Map land.
///
/// The fields are unaligned to save memory. Do not create references to them.
pub struct Land {
    pub r#type: Type,
    pub color: u8,
    pub amount: u32,
}
