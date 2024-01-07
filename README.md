# polygen

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/jwcub/polygen/build.yml)](https://github.com/jwcub/polygen/actions)
[![License](https://img.shields.io/github/license/jwcub/polygen)](https://github.com/jwcub/polygen/blob/main/LICENSE)

`polygen` is a polygon-based web game inspired by [generals.io](https://generals.io).

## Prerequisites

- [Node 20+](https://nodejs.org/)
- [Rust 1.34+](https://www.rust-lang.org/)
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

## Deployment

[PM2](https://pm2.keymetrics.io/) is included as a dev-dependency in the project.
To spin up your app in production mode, simply:

```sh
npm run build
npm run start # This will spawn a PM2 daemon named "polygen"
```

The HTTP server listens on port 1606 by default, which can be configured through .env file.

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

Before committing, make sure you run through all the checks:

```sh
npm run build
npm run lint
npm run typecheck
npm run format
```

For Rust code in `/wasm`:

```sh
cd wasm
cargo test
cargo clippy
cargo fmt
```

## License

This project is licensed under the [Unlicense](https://github.com/jwcub/polygen/blob/main/LICENSE).
