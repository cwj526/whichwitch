# Vercel部署指南

本指南将帮助您在Vercel上部署带有PostgreSQL数据库的项目。

## 1. 准备PostgreSQL数据库

在部署到Vercel之前，您需要有一个PostgreSQL数据库。您可以使用以下选项：

### 选项1: Vercel PostgreSQL (推荐)
1. 在Vercel项目的"Storage"选项卡中
2. 点击"Connect Database"并选择"PostgreSQL"
3. 按照提示创建数据库
4. Vercel会自动将数据库URL添加到环境变量中

### 选项2: 外部PostgreSQL数据库
您也可以使用外部PostgreSQL服务，如：
- Supabase
- Neon
- Railway
- AWS RDS
- Google Cloud SQL

## 2. 配置环境变量

在Vercel项目的"Settings" > "Environment Variables"中添加以下变量：

| 变量名 | 值 | 备注 |
|-------|-----|-----|
| DATABASE_URL | postgresql://username:password@hostname:port/database_name | 使用您的数据库连接字符串 |
| NEXTAUTH_SECRET | 随机生成的密钥 | 使用 https://generate-secret.now.sh/32 生成 |
| NEXTAUTH_URL | https://your-vercel-app.vercel.app | 使用您的Vercel应用URL |

## 3. 添加构建命令

确保您的package.json中包含以下脚本：

```json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "start": "next start"
  }
}
```

## 4. 配置Prisma迁移

在Vercel项目的"Settings" > "Build & Development Settings"中设置：

- Build Command: `npx prisma migrate deploy && next build`

这将确保在部署时自动应用数据库迁移。

## 5. 本地测试

在部署前，建议在本地进行测试：

1. 确保本地数据库已启动并运行
2. 更新`.env.local`文件中的数据库连接信息
3. 运行以下命令：
   ```bash
   pnpm run dev
   ```
4. 访问 http://localhost:3000/auth/register 创建账户并测试功能

## 6. 首次部署

首次部署时，您需要手动创建数据库表。您可以使用以下方法之一：

### 方法1: 本地迁移
1. 在本地运行：
   ```bash
   npx prisma migrate dev --name init
   ```
2. 这将创建迁移文件并应用到本地数据库
3. 将迁移文件提交到版本控制系统
4. Vercel部署时会自动应用这些迁移

### 方法2: 使用Prisma Studio
1. 运行：
   ```bash
   npx prisma studio
   ```
2. 在Prisma Studio中手动创建表结构

## 7. 部署后验证

部署完成后：
1. 访问您的Vercel应用URL
2. 尝试注册一个新账户
3. 登录并访问个人资料页面
4. 确认所有功能正常工作

## 故障排除

### 常见问题

1. **数据库连接错误**
   - 检查DATABASE_URL环境变量是否正确
   - 确保数据库服务器允许来自Vercel的连接

2. **认证相关错误**
   - 检查NEXTAUTH_SECRET和NEXTAUTH_URL是否正确配置
   - 确保SessionProvider已在layout.tsx中正确设置

3. **Prisma迁移失败**
   - 确保迁移文件已包含在部署中
   - 检查数据库用户是否有足够的权限