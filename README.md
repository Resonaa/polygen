# polygen

## 使用方法

- 将 `.env.example` 复制为 `.env`，并填写其中配置项
  ```shell
  cp ./.env.example ./.env
  ```
- 安装依赖项
  ```shell
  npm i
  ```
- 初始化数据库
  ```shell
  npm run setup
  ```
- 启动服务器
  ```shell
  npm run dev
  ```

## HTTPS

HTTPS 服务默认关闭，在  `.env` 中填写证书路径即可开启