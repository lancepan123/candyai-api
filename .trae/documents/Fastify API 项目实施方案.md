基于您的需求，我为您设计了基于 Fastify + TypeScript 的 API 项目方案。详细的设计文档已生成在 `ARCHITECTURE_DESIGN.md` 中。

以下是具体的实施计划：

## 1. 项目初始化 (Project Initialization)
- [ ] 初始化 `package.json` 和 `tsconfig.json`
- [ ] 安装基础依赖 (Fastify, TypeScript, ts-node 等)
- [ ] 配置开发环境规范 (ESLint, Prettier)
- [ ] 创建基础目录结构

## 2. 基础设施搭建 (Infrastructure)
- [ ] 编写 `docker-compose.yml` 用于本地启动 MySQL 和 Redis
- [ ] 配置环境变量管理 (`dotenv`)

## 3. 数据库与 ORM (Database & ORM)
- [ ] 安装 Drizzle ORM 和 MySQL 驱动
- [ ] 定义数据库 Schema (Users, Products, Orders)
- [ ] 配置 Drizzle Kit 并执行首次迁移

## 4. 核心模块封装 (Core Modules)
- [ ] **Redis & Queue**: 封装 BullMQ 和 Redis 连接
- [ ] **Storage**: 封装阿里云 OSS 客户端 (支持预签名 URL)
- [ ] **Socket.io**: 集成 Socket.io 服务端
- [ ] **Auth**: 实现 JWT 认证中间件 (Admin/User 角色分离)

## 5. 业务功能开发 (Feature Development)
### Admin 端
- [ ] 商品管理 API (增删改查)
- [ ] 订单管理 API (查看、发货)
- [ ] 用户管理 API (列表、封禁)

### User 端
- [ ] 用户注册与登录
- [ ] 商品浏览与搜索
- [ ] 购物车与下单流程
- [ ] 个人订单中心

## 6. 异步任务与实时通知 (Async & Real-time)
- [ ] 实现订单超时自动取消任务 (BullMQ)
- [ ] 实现订单状态变更的 Socket 推送

请确认此方案是否符合您的预期？如果确认，我将开始从“项目初始化”步骤着手开发。
