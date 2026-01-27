# CandyAI API

基于 Fastify + TypeScript 的高性能 API 服务。

## 技术栈
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: MySQL + Drizzle ORM
- **Queue**: BullMQ + Redis
- **Real-time**: Socket.io
- **Storage**: Aliyun OSS

## 快速开始

### 1. 启动基础设施
确保本地安装了 Docker 和 Docker Compose。
```bash
docker-compose up -d
```

### 2. 配置环境变量
复制 `.env.example` (如果有) 或直接编辑 `.env` 文件，填入阿里云 OSS 配置。
```bash
# .env
DATABASE_URL=mysql://root:password@localhost:3306/candyai
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret
```

### 3. 数据库迁移
```bash
npm run db:generate
npm run db:migrate
```

### 4. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## API 文档
- **Admin**: `/api/admin/...`
- **User**: `/api/user/...`
- **Auth**: `/api/auth/...`
