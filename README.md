# Minimax H3 Prompt Collection

一个使用 Next.js、SQLite 和远程视频元数据构建的单管理员提示词作品集。

## 本地开发

```bash
npm ci --cache /tmp/minimax-npm-cache
cp .env.example .env.local
npm run admin:hash
```

把哈希写入 `ADMIN_SECRET_HASH`，并为 `SESSION_SECRET` 设置至少 32 个随机字符，然后运行：

```bash
npm run dev
```

访问 `http://localhost:3000`，管理后台位于 `/admin`。SQLite 数据库会按 `DATABASE_PATH` 自动创建。

## 验证

```bash
npm test
npm run lint
npm run build
```

## Docker

从 `.env.example` 创建 `.env` 并填写密钥，然后运行：

```bash
docker compose up --build -d
```

`./data` 会挂载到容器中，容器重启不会删除 SQLite 数据。作品只引用 YouTube、Bilibili 或其他 HTTPS 视频地址，不上传本地图片和视频。
