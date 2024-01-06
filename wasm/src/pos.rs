/// Linear map index. Starts from 0.
pub type Index = u8;

/// 2D map position. Starts from (0, 0).
pub type Pos = (u8, u8);

/// Types that can be converted to position.
pub trait ToPos {
    /// Converts self to position.
    fn to_pos(self, width: u8) -> Pos;
}

impl ToPos for Index {
    fn to_pos(self, width: u8) -> Pos {
        (self / width, self % width)
    }
}

impl ToPos for Pos {
    fn to_pos(self, _width: u8) -> Pos {
        self
    }
}

/// Types that can be converted to index.
pub trait ToIndex {
    /// Converts self to index.
    fn to_index(self, width: u8) -> Index;
}

impl ToIndex for Pos {
    fn to_index(self, width: u8) -> Index {
        self.0 * width + self.1
    }
}

impl ToIndex for Index {
    fn to_index(self, _width: u8) -> Index {
        self
    }
}
