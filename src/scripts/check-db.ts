import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkConnection() {
  const dbUrl = process.env.DATABASE_URL;
  console.log(`尝试连接数据库: ${dbUrl?.replace(/:[^:@]+@/, ':****@')}`); // 隐藏密码打印

  try {
    const connection = await mysql.createConnection(dbUrl!);
    console.log('✅ 成功连接到 MySQL!');
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ 连接失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
        console.log('提示: 请确保 MySQL 服务已启动且监听在默认端口。');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('提示: 用户名或密码错误，请检查 .env 文件配置。');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.log('提示: 数据库不存在。尝试连接到服务器并创建数据库...');
        try {
            // 尝试不带数据库名连接，然后创建数据库
            const urlWithoutDb = dbUrl!.substring(0, dbUrl!.lastIndexOf('/'));
            const connection = await mysql.createConnection(urlWithoutDb);
            console.log('✅ 成功连接到 MySQL 服务器 (无数据库模式)');
            const dbName = dbUrl!.split('/').pop()?.split('?')[0];
            if (dbName) {
                await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
                console.log(`✅ 成功创建数据库: ${dbName}`);
            }
            await connection.end();
            process.exit(0);
        } catch (createError: any) {
             console.error('❌ 创建数据库失败:', createError.message);
        }
    }
    process.exit(1);
  }
}

checkConnection();
