// 認証チェック
requireAuth();

let selectedType = null;

// タイプ選択
const typeOptions = document.querySelectorAll('.type-option');

typeOptions.forEach(option => {
  option.addEventListener('click', () => {
    // 全ての選択を解除
    typeOptions.forEach(opt => opt.classList.remove('selected'));

    // 選択したものにクラスを追加
    option.classList.add('selected');
    selectedType = option.dataset.type;
  });
});

// 戻るボタン
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = '6-write.html';
});

// 放つボタン
document.getElementById('sendBtn').addEventListener('click', async () => {
  if (!selectedType) {
    alert('送信先を選択してください');
    return;
  }

  // sessionStorageから投稿内容を取得
  const postContent = sessionStorage.getItem('postContent');
  const postAnonymous = sessionStorage.getItem('postAnonymous');
  const postNagare = sessionStorage.getItem('postNagare');

  if (!postContent) {
    alert('投稿内容が見つかりません');
    window.location.href = '6-write.html';
    return;
  }

  const postData = {
    content: postContent,
    letter_type: selectedType || 'public',  // 手紙タイプを追加
    is_anonymous: postAnonymous === 'true',
    is_shooting_star: postNagare === 'true'
  };
  const result = await createPost(postData);

  if (result.success) {
    // sessionStorageをクリア
    sessionStorage.removeItem('postContent');
    sessionStorage.removeItem('postAnonymous');
    sessionStorage.removeItem('postNagare');

    alert('投稿しました');
    window.location.href = '5-home.html';
  } else {
    alert(result.error || '投稿に失敗しました');
  }
});