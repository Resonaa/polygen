use cfg_if::cfg_if;

cfg_if! {
    if #[cfg(feature = "client")] {
        use lol_alloc::{AssumeSingleThreaded, FreeListAllocator};

        #[global_allocator]
        static ALLOCATOR: AssumeSingleThreaded<FreeListAllocator> =
            unsafe { AssumeSingleThreaded::new(FreeListAllocator::new()) };
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
