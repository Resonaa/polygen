# polygen

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/jwcub/polygen/build.yml)](https://github.com/jwcub/polygen/actions)
[![License](https://img.shields.io/github/license/jwcub/polygen)](https://github.com/jwcub/polygen/blob/main/LICENSE)

`polygen` is a polygon-based web game inspired by [generals.io](https://generals.io).

## Prerequisites

- [Node 20+](https://nodejs.org/)
- [Rust 1.30+](https://www.rust-lang.org/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)

## Development

- Copy .env file:

  ```sh
  cp .env.example .env
  ```

- Build wasm target:

  ```sh
  npm run wasm
  ```

- Install dependencies:

  ```sh
  npm install
  ```

- Setup database:

  ```sh
  npm run setup
  ```

- Start dev server:
  ```sh
  npm run dev
  ```

## Benchmarking

Benchmarks are available for performance-sensitive functions.

- Run all benchmarks:

  ```sh
  npm run bench
  ```

- Run a single benchmark:
  ```sh
  npm run bench:hash
  ```

Refer to [package.json](https://github.com/jwcub/polygen/blob/main/package.json) for more information.

## Contributing

Before committing, make sure to run through the checks:

```sh
npm run build
npm run lint
npm run typecheck
npm run format
```

For Rust code in `/wasm`, use Clippy and Rustfmt:

```sh
cd wasm
cargo clippy
cargo fmt
```

## License

This project is licensed under the [Unlicense](https://github.com/jwcub/polygen/blob/main/LICENSE).
