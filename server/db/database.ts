import sqlite3 from 'better-sqlite3';
import { join } from 'path';

// 确保数据库目录存在
import { mkdirSync, existsSync } from 'fs';
const dbDir = join(process.cwd(), 'data');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const dbPath = join(dbDir, 'whichwitch.db');
const db = sqlite3(dbPath);

// 初始化数据库表
export const initDatabase = () => {
  // 创建用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_address TEXT UNIQUE NOT NULL,
      did TEXT UNIQUE NOT NULL,
      name TEXT,
      bio TEXT,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      skill TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, skill)
    );
  `);
};

// 用户相关操作
export const getUserByWalletAddress = (walletAddress: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE wallet_address = ?');
  return stmt.get(walletAddress);
};

export const getUserByDid = (did: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE did = ?');
  return stmt.get(did);
};

export const createUser = (userData: {
  walletAddress: string;
  did: string;
  name?: string;
  bio?: string;
  avatar?: string;
}) => {
  const stmt = db.prepare(`
    INSERT INTO users (wallet_address, did, name, bio, avatar, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `);
  return stmt.get(
    userData.walletAddress,
    userData.did,
    userData.name,
    userData.bio,
    userData.avatar
  );
};

export const updateUser = (id: number, userData: {
  name?: string;
  bio?: string;
  avatar?: string;
}) => {
  const stmt = db.prepare(`
    UPDATE users
    SET name = COALESCE(?, name),
        bio = COALESCE(?, bio),
        avatar = COALESCE(?, avatar),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `);
  return stmt.get(userData.name, userData.bio, userData.avatar, id);
};

// 技能相关操作
export const addUserSkill = (userId: number, skill: string) => {
  const stmt = db.prepare('INSERT OR IGNORE INTO skills (user_id, skill) VALUES (?, ?)');
  return stmt.run(userId, skill);
};

export const getUserSkills = (userId: number) => {
  const stmt = db.prepare('SELECT skill FROM skills WHERE user_id = ?');
  return stmt.all(userId) as { skill: string }[];
};

export const removeUserSkill = (userId: number, skill: string) => {
  const stmt = db.prepare('DELETE FROM skills WHERE user_id = ? AND skill = ?');
  return stmt.run(userId, skill);
};

// 关闭数据库连接
export const closeDatabase = () => {
  db.close();
};

// 导出数据库实例供其他模块使用
export default db;