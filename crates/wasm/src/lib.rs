//! # polygen GM library
//!
//! ## Overview
//!
//! The crate can be used as a regular Rust lib or be compiled into WebAssembly.
//!
//! ### GM manipulation
//!
//! - [`land::Land`], [`land::Type`] in [`land`].
//! - [`gm::GM`] in [`gm`].

pub mod land;

pub mod gm;

pub mod generator;

pub use gm::GM;
pub use land::{Land, Type};
