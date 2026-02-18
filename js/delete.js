// 認証チェック
requireAuth();

// アカウント削除フォーム処理
document.getElementById('deleteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const password = prompt('パスワードを入力してください');
  
  if (!password) {
    return;
  }

  const result = await deleteAccount(password);

  if (result.success) {
    alert('アカウントを削除しました');
    window.location.href = '4-login.html';
  } else {
    alert(result.error || 'アカウント削除に失敗しました');
  }
});