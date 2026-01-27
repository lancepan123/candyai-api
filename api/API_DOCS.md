# CandyAI API 文档

**Base URL**: `http://localhost:3000`
**Documentation UI**: `http://localhost:3000/documentation`

## 1. 认证 (Auth)

### 用户注册
- **URL**: `POST /api/auth/user/register`
- **Body**:
  ```json
  {
    "username": "string (min 3 chars)",
    "phone": "string (min 11 chars)",
    "password": "string (min 6 chars)",
    "avatarUrl": "string (optional)"
  }
  ```

### 用户登录
- **URL**: `POST /api/auth/user/login`
- **Body**:
  ```json
  {
    "phone": "string",
    "password": "string"
  }
  ```
- **Response**: `{ "token": "jwt_token" }`

### 用户退出
- **URL**: `POST /api/auth/user/logout`
- **Headers**: `Authorization: Bearer <token>`

### 管理员登录
- **URL**: `POST /api/auth/admin/login`
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: `{ "token": "jwt_token" }`

### 管理员退出
- **URL**: `POST /api/auth/admin/logout`
- **Headers**: `Authorization: Bearer <token>`

---

## 2. 管理员接口 (Admin)
**Headers**: `Authorization: Bearer <admin_token>`

### 个人信息
- **获取当前管理员信息**: `GET /api/admin/me`
- **更新当前管理员信息**: `PATCH /api/admin/me`
  - Body: `{ "username": "string", "avatarUrl": "string" }`

### 管理员管理
- **获取管理员列表**: `GET /api/admin/admins`
- **添加管理员**: `POST /api/admin/admins`
  - Body: `{ "username": "string", "password": "string", "avatarUrl": "string" }`
- **禁用/解禁管理员**: `PATCH /api/admin/admins/:id/ban`
  - Body: `{ "status": "active" | "banned" }`

### 操作日志
- **获取操作日志**: `GET /api/admin/logs?limit=50`

### 用户管理
- **获取用户列表**: `GET /api/admin/users?page=1&limit=10`
- **获取用户统计**: `GET /api/admin/users/stats`
  - Response: `{ "totalUsers": 100, "activeUsers": 95, "bannedUsers": 5 }`
- **获取用户详情**: `GET /api/admin/users/:id`
- **封禁/解封用户**: `PATCH /api/admin/users/:id/ban`
  - Body: `{ "isBanned": boolean }`

### AI 模型管理
- **获取模型列表**: `GET /api/admin/ai-models`
- **创建模型**: `POST /api/admin/ai-models`
- **更新模型**: `PUT /api/admin/ai-models/:id`
- **删除模型**: `DELETE /api/admin/ai-models/:id`
- **获取模型统计**: `GET /api/admin/ai-models/stats`

### 商品管理
- **创建商品**: `POST /api/admin/products`
- **获取订单**: `GET /api/admin/orders`

---

## 3. 用户接口 (User)
**Headers**: `Authorization: Bearer <user_token>`

*(此处根据实际 userRoutes 内容补充，通常包含获取个人信息、下单等)*
