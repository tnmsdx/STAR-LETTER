// 認証チェック
requireAuth();

// 投稿作成フォーム処理
document.getElementById('writeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const content = document.getElementById('content').value;
  const isAnonymous = document.getElementById('anonymous').checked;
  const isNagare = document.getElementById('nagare').checked;
  
  // sessionStorageに一時保存
  sessionStorage.setItem('postContent', content);
  sessionStorage.setItem('postAnonymous', isAnonymous);
  sessionStorage.setItem('postNagare', isNagare);
  
  // 手紙の種類選択画面へ遷移
  window.location.href = '8-letter-types.html';
});