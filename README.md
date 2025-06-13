# polygen

-----

## Prerequisites

- [Rust](https://www.rust-lang.org/) 1.87+
- [Bun](https://bun.sh/) 1.2+
- [wasm-pack](https://rustwasm.github.io/wasm-pack/) 0.13+

## Building

```sh
bun install          # install TypeScript dependencies
bun wasm             # install Rust dependencies and build WebAssembly package
bun release          # build the site for production
bun preview          # preview the site
```

### Running tests

```sh
cargo test           # run Rust tests
```

## Development

```sh
bun dev              # start dev server
```

### CI

Make sure you have Rustfmt installed on nightly channel.

```sh
rustup component add rustfmt --toolchain nightly
```

```sh
bun format           # lint/format TypeScript code
cargo clippy         # lint Rust code
cargo +nightly fmt   # format Rust code
```
