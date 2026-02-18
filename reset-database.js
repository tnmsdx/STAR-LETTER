const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 全テーブルのデータを削除
  db.run('DELETE FROM comments', (err) => {
    if (err) console.error('コメント削除エラー:', err);
    else console.log('✓ コメントを全て削除しました');
  });

  db.run('DELETE FROM posts', (err) => {
    if (err) console.error('投稿削除エラー:', err);
    else console.log('✓ 投稿を全て削除しました');
  });

  db.run('DELETE FROM users', (err) => {
    if (err) console.error('ユーザー削除エラー:', err);
    else console.log('✓ ユーザーを全て削除しました');
  });

  // オートインクリメントのリセット
  db.run("DELETE FROM sqlite_sequence", (err) => {
    if (err) console.error('シーケンスリセットエラー:', err);
    else console.log('✓ IDをリセットしました');
  });
});

db.close(() => {
  console.log('\n全てのデータを削除しました。');
  console.log('サーバーを再起動してください。');
});