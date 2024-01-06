use cfg_if::cfg_if;

cfg_if! {
    if #[cfg(feature = "client")] {
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    } else {
        mod hash;
    }
}

mod init;
mod land;
mod map;
mod map_index;
mod map_utils;
mod pos;
