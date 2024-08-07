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

**Note: This repository is temporarily archived and will not be reopened in a short time.**

## Prerequisites

- [Node 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

## Development

- Install dependencies:

```sh
pnpm install
```

- Setup database:

```sh
pnpm db
```

- Start dev server:

```sh
pnpm dev
```

## Deployment

We use [PM2](https://pm2.keymetrics.io/) for deployment.

```sh
pnpm build
pnpm start # Spawns a PM2 daemon named "polygen"
```

The HTTP server listens on port 1606 by default, which can be configured through environment variables.

It's strongly recommended to use your own `.env.local` file for production:

```sh
cp .env .env.local
```

## Contributing

Before pushing your commits, be sure to run through all the checks:

```sh
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm bench
pnpm format
```

## License

This project is licensed under the [Unlicense](https://github.com/jwcub/polygen/blob/main/LICENSE).
