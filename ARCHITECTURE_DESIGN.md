# CandyAI API 项目架构设计方案

## 1. 技术栈概览 (Tech Stack)

*   **Runtime**: Node.js (推荐 v20+ LTS)
*   **Language**: TypeScript
*   **Framework**: Fastify (高性能 Web 框架)
*   **Database**: MySQL 8.0+
*   **ORM**: Drizzle ORM (类型安全，高性能)
*   **Real-time**: Socket.io (WebSocket 通信)
*   **Queue**: BullMQ + Redis (异步任务处理)
*   **Storage**: 阿里云 OSS (对象存储)
*   **Package Manager**: pnpm (推荐)

## 2. 项目目录结构 (Directory Structure)

采用模块化结构，区分 `src` 下的 `modules`，并将 `admin` 和 `user` 的业务逻辑分离或共享核心逻辑。

```text
candyai-api/
├── src/
│   ├── config/                 # 环境变量与全局配置
│   ├── db/                     # 数据库连接与 Drizzle Schema 定义
│   │   ├── schema/             # 数据库表定义
│   │   ├── migrations/         # 数据库迁移文件
│   │   └── index.ts            # DB 实例导出
│   ├── lib/                    # 第三方服务封装 (OSS, Redis, Socket, Queue)
│   ├── middlewares/            # 全局中间件 (Auth, Logger, ErrorHandler)
│   ├── modules/                # 业务模块
│   │   ├── auth/               # 认证模块 (登录/注册)
│   │   ├── users/              # 用户管理
│   │   ├── products/           # 商品管理
│   │   ├── orders/             # 订单管理
│   │   └── common/             # 通用类型与工具
│   ├── routes/                 # 路由定义
│   │   ├── admin/              # Admin 端路由聚合
│   │   └── user/               # User 端路由聚合
│   ├── types/                  # 全局类型定义
│   ├── utils/                  # 工具函数
│   ├── app.ts                  # Fastify 应用实例创建
│   └── server.ts               # 服务启动入口
├── .env                        # 环境变量
├── .env.example                # 环境变量示例
├── drizzle.config.ts           # Drizzle 配置文件
├── package.json
└── tsconfig.json
```

## 3. 数据库设计 (Database Schema Draft)

基于 Drizzle ORM 定义。

### 3.1 Users (用户表)
*   `id`: bigint (PK)
*   `username`: varchar
*   `email`: varchar (Unique)
*   `password_hash`: varchar
*   `role`: enum ('user', 'admin')
*   `avatar_url`: varchar
*   `created_at`: timestamp
*   `updated_at`: timestamp

### 3.2 Products (商品表)
*   `id`: bigint (PK)
*   `name`: varchar
*   `description`: text
*   `price`: decimal
*   `stock`: int
*   `images`: json (图片 URL 数组)
*   `status`: enum ('active', 'draft', 'archived')
*   `created_at`: timestamp

### 3.3 Orders (订单表)
*   `id`: bigint (PK)
*   `user_id`: bigint (FK -> Users.id)
*   `total_amount`: decimal
*   `status`: enum ('pending', 'paid', 'shipped', 'completed', 'cancelled')
*   `created_at`: timestamp

### 3.4 OrderItems (订单项表)
*   `id`: bigint (PK)
*   `order_id`: bigint (FK -> Orders.id)
*   `product_id`: bigint (FK -> Products.id)
*   `quantity`: int
*   `price_at_purchase`: decimal

## 4. 关键功能模块设计

### 4.1 认证与授权 (Authentication & Authorization)
*   **Admin 端**: 需要管理员权限，使用 JWT 进行身份验证，Payload 中包含 `role: 'admin'`。
*   **User 端**: 普通用户权限，使用 JWT。
*   **实现**: 使用 `@fastify/jwt` 插件，配合自定义 Decorator `authenticate` 和 `authorize(['admin'])`。

### 4.2 实时通信 (Socket.io)
*   **用途**: 订单状态更新通知、客服消息等。
*   **集成**: 在 Fastify 启动时挂载 Socket.io 服务。
*   **鉴权**: Socket 连接握手时校验 JWT token。

### 4.3 异步任务队列 (BullMQ)
*   **用途**:
    *   发送邮件/短信通知。
    *   订单超时自动取消。
    *   图片/视频转码或处理。
*   **架构**:
    *   Producer: API 接收请求后将任务推入 Redis 队列。
    *   Worker: 独立的 Worker 进程或在该服务内运行 Worker 消费队列。

### 4.4 文件上传 (Aliyun OSS)
*   **流程**:
    *   方式 A (推荐): 后端生成 OSS 预签名 URL (Presigned URL)，前端直传 OSS。减轻服务器带宽压力。
    *   方式 B: 前端上传到后端，后端转发到 OSS (适合小文件或需要严格处理的文件)。

## 5. API 路由规划示例

### Admin API (`/api/admin/...`)
*   `POST /auth/login`
*   `GET /users` (列表, 分页, 搜索)
*   `POST /products` (创建商品)
*   `PATCH /products/:id` (更新商品)
*   `GET /orders` (查看所有订单)
*   `POST /orders/:id/ship` (发货)

### User API (`/api/user/...`)
*   `POST /auth/register`
*   `POST /auth/login`
*   `GET /products` (浏览商品)
*   `POST /orders` (创建订单)
*   `GET /orders/my` (我的订单)
*   `GET /profile`

## 6. 开发与部署流程
1.  **初始化**: 配置 TS, Fastify, Drizzle, Docker (MySQL, Redis)。
2.  **开发**: 编写 Schema -> 生成 Migration -> 编写 API -> 测试。
3.  **构建**: `tsc` 编译为 JS。
4.  **运行**: `node dist/server.js`。
