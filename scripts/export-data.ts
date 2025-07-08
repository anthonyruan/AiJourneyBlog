import { writeFileSync } from 'fs';
import { db } from '../server/db';
import * as schema from '../shared/schema';

async function exportData() {
  try {
    console.log('开始导出数据...');
    
    // 导出所有表的数据
    const data = {
      users: await db.select().from(schema.users),
      posts: await db.select().from(schema.posts),
      projects: await db.select().from(schema.projects),
      comments: await db.select().from(schema.comments),
      messages: await db.select().from(schema.messages),
      subscribers: await db.select().from(schema.subscribers),
      aboutPage: await db.select().from(schema.aboutPage),
    };
    
    // 保存为JSON文件
    writeFileSync('exported-data.json', JSON.stringify(data, null, 2));
    
    console.log('数据导出完成！文件保存为: exported-data.json');
    console.log(`导出统计:
- 用户: ${data.users.length}
- 文章: ${data.posts.length}
- 项目: ${data.projects.length}
- 评论: ${data.comments.length}
- 消息: ${data.messages.length}
- 订阅者: ${data.subscribers.length}`);
    
  } catch (error) {
    console.error('导出过程中出错:', error);
  }
}

exportData();