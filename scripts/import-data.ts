import { readFileSync } from 'fs';
import { db } from '../server/db';
import * as schema from '../shared/schema';

async function importData() {
  try {
    console.log('开始导入数据...');
    
    // 读取导出的数据
    const dataFile = readFileSync('exported-data.json', 'utf-8');
    const data = JSON.parse(dataFile);
    
    // 导入数据到本地数据库
    if (data.users && data.users.length > 0) {
      await db.insert(schema.users).values(data.users).onConflictDoNothing();
      console.log(`导入了 ${data.users.length} 个用户`);
    }
    
    if (data.posts && data.posts.length > 0) {
      await db.insert(schema.posts).values(data.posts).onConflictDoNothing();
      console.log(`导入了 ${data.posts.length} 篇文章`);
    }
    
    if (data.projects && data.projects.length > 0) {
      await db.insert(schema.projects).values(data.projects).onConflictDoNothing();
      console.log(`导入了 ${data.projects.length} 个项目`);
    }
    
    if (data.comments && data.comments.length > 0) {
      await db.insert(schema.comments).values(data.comments).onConflictDoNothing();
      console.log(`导入了 ${data.comments.length} 条评论`);
    }
    
    if (data.messages && data.messages.length > 0) {
      await db.insert(schema.messages).values(data.messages).onConflictDoNothing();
      console.log(`导入了 ${data.messages.length} 条消息`);
    }
    
    if (data.subscribers && data.subscribers.length > 0) {
      await db.insert(schema.subscribers).values(data.subscribers).onConflictDoNothing();
      console.log(`导入了 ${data.subscribers.length} 个订阅者`);
    }
    
    if (data.aboutPage && data.aboutPage.length > 0) {
      await db.insert(schema.aboutPage).values(data.aboutPage).onConflictDoNothing();
      console.log(`导入了关于页面数据`);
    }
    
    console.log('数据导入完成！');
    
  } catch (error) {
    console.error('导入过程中出错:', error);
  }
}

importData();