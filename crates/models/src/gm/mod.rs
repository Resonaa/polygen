//! GM operations.

use std::iter;

mod land;

pub use land::{Land, Type};

/// Game map.
#[derive(Clone, Debug)]
pub struct GM {
  pub edges: Vec<Vec<usize>>,
  pub lands: Vec<Land>
}

impl GM {
  /// Creates an empty [`GM`] with the given size.
  pub fn new(size: usize) -> Self {
    Self {
      lands: iter::repeat_n(Default::default(), size).collect(),
      edges: iter::repeat_n(Default::default(), size).collect()
    }
  }

  pub fn add_edge(&mut self, u: usize, v: usize) {
    self.edges[u].push(v);
    self.edges[v].push(u);
  }

  pub fn has_edge(&self, u: usize, v: usize) -> bool {
    self.edges[u].contains(&v)
  }
}
