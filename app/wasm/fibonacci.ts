export { fibonacci as fibonacciRust } from "fibonacci/pkg/fibonacci";

/**
 * Calculates fib(n) % m.
 */
export function fibonacciJs(n: number, m: number) {
  if (n === 1 || n === 2) {
    return 1;
  } else {
    let a = 1,
      b = 1;

    for (let i = 0; i < n - 2; i++) {
      const c = (a + b) % m;
      a = b;
      b = c;
    }

    return b;
  }
}
