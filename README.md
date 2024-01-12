<div align="center">

# polygen

Polygon-based web game inspired by [generals.io](https://generals.io).

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/jwcub/polygen/build.yml?style=flat-square)](https://github.com/jwcub/polygen/actions)
[![License](https://img.shields.io/github/license/jwcub/polygen?style=flat-square&color=orange)](https://github.com/jwcub/polygen/blob/main/LICENSE)
[![GitHub repo size](https://img.shields.io/github/repo-size/jwcub/polygen?style=flat-square)](https://github.com/jwcub/polygen)
[![GitHub Repo stars](https://img.shields.io/github/stars/jwcub/polygen?style=flat-square&color=yellow)](https://github.com/jwcub/polygen/stargazers)
[![GitHub commit activity](https://img.shields.io/github/commit-activity/y/jwcub/polygen?style=flat-square)](https://github.com/jwcub/polygen/commits/main/)
[![GitHub contributors](https://img.shields.io/github/contributors/jwcub/polygen?style=flat-square)](https://github.com/jwcub/polygen/graphs/contributors)
[![Website](https://img.shields.io/badge/website-online-green?style=flat-square)](https://polygen.fun)

</div>

## Prerequisites

- [Node 20+](https://nodejs.org/)
- [Rust (+Nightly)](https://www.rust-lang.org/)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)

The Nightly toolchain and `wasm32-unknown-unknown` target are required for building the WebAssembly package.

```sh
rustup install nightly
rustup +nightly target add wasm32-unknown-unknown
```

## Development

- Copy .env file:

```sh
cp .env.example .env
```

- Build WebAssembly target:

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

Before pushing your commits, be sure to run through all the checks:

```sh
npm run build
npm run lint
npm run typecheck
npm run format
```

For Rust code in `/wasm`:

```sh
cargo test
cargo clippy
cargo fmt
```

It's also recommended to view the generated documentation:

```sh
cargo doc --no-deps --open --target wasm32-unknown-unknown
```

## License

This project is licensed under the [Unlicense](https://github.com/jwcub/polygen/blob/main/LICENSE).
