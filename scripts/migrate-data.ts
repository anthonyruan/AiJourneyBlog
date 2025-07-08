import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';

// 原数据库连接（当前Replit数据库）
const sourceDb = drizzle(new Pool({ 
  connectionString: process.env.SOURCE_DATABASE_URL 
}), { schema });

// 目标数据库连接（新的Neon数据库）
const targetDb = drizzle(new Pool({ 
  connectionString: process.env.TARGET_DATABASE_URL 
}), { schema });

async function migrateData() {
  try {
    console.log('开始迁移数据...');
    
    // 1. 迁移用户数据
    const users = await sourceDb.select().from(schema.users);
    if (users.length > 0) {
      await targetDb.insert(schema.users).values(users).onConflictDoNothing();
      console.log(`迁移了 ${users.length} 个用户`);
    }
    
    // 2. 迁移文章数据
    const posts = await sourceDb.select().from(schema.posts);
    if (posts.length > 0) {
      await targetDb.insert(schema.posts).values(posts).onConflictDoNothing();
      console.log(`迁移了 ${posts.length} 篇文章`);
    }
    
    // 3. 迁移项目数据
    const projects = await sourceDb.select().from(schema.projects);
    if (projects.length > 0) {
      await targetDb.insert(schema.projects).values(projects).onConflictDoNothing();
      console.log(`迁移了 ${projects.length} 个项目`);
    }
    
    // 4. 迁移评论数据
    const comments = await sourceDb.select().from(schema.comments);
    if (comments.length > 0) {
      await targetDb.insert(schema.comments).values(comments).onConflictDoNothing();
      console.log(`迁移了 ${comments.length} 条评论`);
    }
    
    // 5. 迁移其他数据表...
    const messages = await sourceDb.select().from(schema.messages);
    if (messages.length > 0) {
      await targetDb.insert(schema.messages).values(messages).onConflictDoNothing();
      console.log(`迁移了 ${messages.length} 条消息`);
    }
    
    const subscribers = await sourceDb.select().from(schema.subscribers);
    if (subscribers.length > 0) {
      await targetDb.insert(schema.subscribers).values(subscribers).onConflictDoNothing();
      console.log(`迁移了 ${subscribers.length} 个订阅者`);
    }
    
    console.log('数据迁移完成！');
    
  } catch (error) {
    console.error('迁移过程中出错:', error);
  }
}

migrateData();