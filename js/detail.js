// 認証チェック
requireAuth();

// URLパラメータから投稿IDを取得
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

if (!postId) {
  alert('投稿が見つかりません');
  window.location.href = '5-home.html';
}

// 投稿詳細を表示
async function displayPost() {
  const result = await getPost(postId);
  const postDetailEl = document.getElementById('postDetail');
  
  if (result.success) {
    const post = result.data;
    const date = new Date(post.created_at);
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    
    postDetailEl.innerHTML = `
      <div class="post-meta">
        <div class="post-author-name">${post.is_anonymous ? '匿名' : post.username}</div>
        <div class="post-date-time">${dateStr}</div>
      </div>
      <div class="post-text">${post.content}</div>
    `;
  } else {
    postDetailEl.innerHTML = '<div style="text-align: center; padding: 40px;">投稿が見つかりません</div>';
  }
}

// コメント一覧を表示
async function displayComments() {
  const result = await getComments(postId);
  const commentsListEl = document.getElementById('commentsList');
  
  if (result.success && result.data.length > 0) {
    commentsListEl.innerHTML = result.data.map(comment => {
      return `
        <div class="comment-item">
          <div class="comment-author">${comment.username}</div>
          <div class="comment-text">${comment.content}</div>
        </div>
      `;
    }).join('');
  } else {
    commentsListEl.innerHTML = '<div style="color: rgba(255, 255, 255, 0.5); text-align: center; padding: 20px;">まだコメントがありません</div>';
  }
}

// コメント投稿
document.getElementById('commentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const content = document.getElementById('commentInput').value;
  const result = await createComment(postId, content);

  if (result.success) {
    document.getElementById('commentInput').value = '';
    displayComments();
  } else {
    alert(result.error || 'コメントの投稿に失敗しました');
  }
});

// ページ読み込み時
displayPost();
displayComments();