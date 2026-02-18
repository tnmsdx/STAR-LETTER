// 新規登録フォーム処理
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    username: document.getElementById('username').value
  };

  // 一時保存してプロフィール画面へ
  sessionStorage.setItem('registerData', JSON.stringify(formData));
  window.location.href = '3-welcome.html';
});