import { useEffect } from "react";

import { fibonacciJs, fibonacciRust } from "~/wasm/fibonacci";

export default function Wasm() {
  useEffect(() => {
    const n = 1000,
      m = 998244353;

    const startJs = performance.now();
    const resJs = fibonacciJs(n, m);
    const endJs = performance.now();

    const startRust = performance.now();
    const resRust = fibonacciRust(n, m);
    const endRust = performance.now();

    console.log(
      "JavaScript:",
      `fib(${n}) % ${m} = ${resJs}`,
      `${endJs - startJs}ms`
    );
    console.log(
      "WebAssembly:",
      `fib(${n}) % ${m} = ${resRust}`,
      `${endRust - startRust}ms`
    );
  }, []);

  return <></>;
}
