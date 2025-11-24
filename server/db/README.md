# SQLite数据库集成

本项目集成了SQLite数据库，用于存储用户信息和相关数据。SQLite是一个轻量级的嵌入式数据库，非常适合中小型应用，无需单独的数据库服务器。

## 技术栈

- **SQLite3**: 核心数据库引擎
- **better-sqlite3**: 高性能的Node.js SQLite3驱动
- **Next.js API Routes**: 提供数据库访问的API接口

## 数据库结构

### 用户表 (users)

| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | INTEGER PRIMARY KEY | 用户ID，自增长 |
| wallet_address | TEXT UNIQUE NOT NULL | 钱包地址，用于身份认证 |
| did | TEXT UNIQUE NOT NULL | Decentralized ID，用户的去中心化标识符 |
| name | TEXT | 用户名称 |
| bio | TEXT | 用户简介 |
| avatar | TEXT | 用户头像URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 技能表 (skills)

| 字段名 | 类型 | 描述 |
|-------|------|------|
| id | INTEGER PRIMARY KEY | 技能ID，自增长 |
| user_id | INTEGER | 用户ID，外键关联users表 |
| skill | TEXT | 技能名称 |

## API接口

### 获取用户信息

```
GET /api/users?walletAddress={walletAddress}
```

或

```
GET /api/users?did={did}
```

### 创建或更新用户

```
POST /api/users
Content-Type: application/json

{
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "did": "did:whichwitch:0x1234567890123456789012345678901234567890",
  "name": "用户名称",
  "bio": "用户简介",
  "skills": ["绘画", "设计"]
}
```

### 更新用户信息

```
PUT /api/users?id={userId}
Content-Type: application/json

{
  "name": "新名称",
  "bio": "新简介",
  "skills": ["新技能1", "新技能2"]
}
```

## 数据库文件位置

数据库文件存储在项目根目录的 `data` 文件夹中，文件名为 `whichwitch.db`。

## 使用说明

1. 数据库会在首次API调用时自动初始化（创建表结构）
2. 钱包连接时会自动检查用户是否存在，不存在则创建新用户
3. 用户信息会在登录时从数据库加载

## 测试页面

可以访问 `/db-test` 页面来测试数据库功能，包括搜索用户和查看数据库信息。

## 注意事项

1. SQLite数据库适合开发和小型应用使用
2. 对于生产环境的大型应用，可能需要考虑迁移到PostgreSQL或MySQL等数据库
3. 数据库文件不会被版本控制（已添加到.gitignore）