use wasm_bindgen::prelude::*;

/// Calculates fib(n) % m.
#[wasm_bindgen]
pub fn fibonacci(n: u32, m: u32) -> u32 {
    match n {
        1 | 2 => 1,
        _ => {
            let mut a = 1;
            let mut b = 1;

            for _ in 0..n - 2 {
                let c = (a + b) % m;
                a = b;
                b = c;
            }

            b
        }
    }
}
