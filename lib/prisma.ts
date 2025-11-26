// Prisma客户端实例
import { PrismaClient } from '@prisma/client';

// 创建Prisma客户端实例
const prismaClientSingleton = () => {
  return new PrismaClient({
    // 可以在这里添加日志级别等配置
    log: ['query', 'info', 'warn', 'error'],
  });
};

// 定义全局类型
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 确保在开发环境中使用单例模式
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

// 在生产环境中，确保不会泄漏连接
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}