require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDB() {
  console.log('========================================');
  console.log('データベース接続テスト開始...');
  console.log('========================================\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'star_letter_app'
  };

  console.log('接続設定:');
  console.log(`  ホスト: ${config.host}`);
  console.log(`  ユーザー: ${config.user}`);
  console.log(`  データベース: ${config.database}\n`);

  let connection;

  try {
    console.log('⏳ 接続中...');
    connection = await mysql.createConnection(config);
    console.log('✅ データベースに接続しました!\n');

    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ テーブル数: ${tables.length}個\n`);
    
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log('\n========================================');
    console.log('✨ 接続テスト成功!');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ エラー:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

testDB();