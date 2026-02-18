// 認証チェック
requireAuth();

// 色選択
const colorOptions = document.querySelectorAll('.color-option');
let selectedColor = 'blue';

colorOptions.forEach(option => {
  option.addEventListener('click', () => {
    colorOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
    selectedColor = option.dataset.color;
  });
});

// 設定保存
document.getElementById('saveBtn').addEventListener('click', async () => {
  const notification = document.getElementById('notification').checked;
  
  try {
    const token = getToken();
    const response = await fetch('http://localhost:3000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sky_color: selectedColor,
        notification_enabled: notification
      })
    });

    if (response.ok) {
      alert('設定を保存しました');
    } else {
      alert('設定の保存に失敗しました');
    }
  } catch (error) {
    console.error('Save settings error:', error);
    alert('設定の保存に失敗しました');
  }
});

// アカウント削除ページへ
document.getElementById('deleteBtn').addEventListener('click', () => {
  if (confirm('本当にアカウント削除ページへ移動しますか？')) {
    window.location.href = '12-delete.html';
  }
});