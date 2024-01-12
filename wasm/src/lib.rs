//! # polygen WebAssembly module
//!
//! ## Overview
//!
//! The crate is mainly divided into these sections:
//!
//! ### General utilities
//!
//! - Server-side hashing with [`hash::hash`] in [`hash`].
//!
//! ### Map manipulation
//!
//! - [`land::Land`], [`land::LandProperties`], [`land::Type`] in [`land`].
//! - Type definition for [`map::Map`] and [`map::Mode`] in [`map`].
//! - Positioning with [`pos::Index`] and [`pos::Pos`], and their conversion in [`pos`].
//! - Indexing in and iterating through [`map::Map`], provided by [`map_index`].
//! - High-level utilities such as [`map::Map::dist`] defined in [`map_utils`].
//!
//! ### Setup hooks
//!
//! - [`init::init`] to be run right after the setup of WebAssembly instance.
//!
//! ## Feature flags
//!
//! - `client`: Enables global allocator with [lol_alloc](https://crates.io/crates/lol_alloc) and
//! disables server-side functionalities like hashing.
//! - `console_log`: Enables logging to JS console.
//! - `highway`: Google's HighwayHash implementation.
//!
//! By default, `console_log` and `highway` are on, while `client` is off.
//! To build the crate in the minimum size for distribution, turn on the `client` feature and disable the default features.

#![feature(portable_simd)]
#![feature(doc_cfg)]

#[cfg(feature = "client")]
use lol_alloc::{AssumeSingleThreaded, FreeListAllocator};

// Safety: WebAssembly is single-threaded.
#[cfg(feature = "client")]
#[global_allocator]
static ALLOCATOR: AssumeSingleThreaded<FreeListAllocator> =
    unsafe { AssumeSingleThreaded::new(FreeListAllocator::new()) };

#[cfg(any(not(feature = "client"), doc))]
#[doc(cfg(not(feature = "client")))]
pub mod hash;

pub mod init;
pub mod land;
pub mod map;

#[cfg(any(not(feature = "client"), doc))]
#[doc(cfg(not(feature = "client")))]
pub mod map_index;

#[cfg(any(not(feature = "client"), doc))]
#[doc(cfg(not(feature = "client")))]
pub mod map_utils;

pub mod pos;
