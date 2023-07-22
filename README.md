# polygen

## 使用方法

- 将 `.env.example` 复制为 `.env`，并填写其中配置项
  ```sh
  cp ./.env.example ./.env
  ```
- 安装依赖项
  ```sh
  npm i
  ```
- 初始化数据库
  ```sh
  npm run setup
  ```
- 构建并运行
  ```sh
  npm run build
  npm run start
  ```