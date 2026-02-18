// 認証チェック
requireAuth();

// ユーザー情報を表示
const user = getUser();
if (user && user.username) {
  document.getElementById('userName').textContent = user.username;
}

// ログアウトボタン
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  if (confirm('ログアウトしますか？')) {
    logout();
  }
});