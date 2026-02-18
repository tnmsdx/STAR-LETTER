const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('投稿とコメントのみを削除します...\n');

db.serialize(() => {
  // コメントを全て削除
  db.run('DELETE FROM comments', (err) => {
    if (err) {
      console.error('❌ コメント削除エラー:', err);
    } else {
      console.log('✓ コメントを全て削除しました');
    }
  });

  // 投稿を全て削除
  db.run('DELETE FROM posts', (err) => {
    if (err) {
      console.error('❌ 投稿削除エラー:', err);
    } else {
      console.log('✓ 投稿を全て削除しました');
    }
  });

  // 投稿とコメントのIDをリセット
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('posts', 'comments')", (err) => {
    if (err) {
      console.error('❌ シーケンスリセットエラー:', err);
    } else {
      console.log('✓ 投稿・コメントのIDをリセットしました');
    }
  });
});

db.close(() => {
  console.log('\n========================================');
  console.log('✅ 投稿とコメントを削除しました');
  console.log('（ユーザーアカウントは保持されています）');
  console.log('========================================');
  console.log('サーバーを再起動してください');
  console.log('========================================\n');
});