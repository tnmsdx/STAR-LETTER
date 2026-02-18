// 認証チェック
requireAuth();

// 自分の投稿を取得して表示
async function loadMyPosts() {
  const postList = document.getElementById('postList');
  
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/posts/my-posts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('投稿の取得に失敗しました');
    }

    const posts = await response.json();
    
    // 投稿がない場合
    if (posts.length === 0) {
      postList.innerHTML = '<div class="no-posts">まだ手紙を書いていません<br>✨ 最初の手紙を書いてみましょう</div>';
      return;
    }

    // 投稿を表示
    postList.innerHTML = posts.map(post => `
      <div class="post-card" onclick="viewPostDetail(${post.id})">
        <div class="post-content">${escapeHtml(post.content)}</div>
        <div class="post-meta">
          <div class="post-date">
            <span> ${formatDate(post.created_at)}</span>
          </div>
          <div class="post-badges">
            ${post.is_anonymous ? '<span class="badge anonymous">匿名</span>' : ''}
            ${post.is_shooting_star ? '<span class="badge shooting-star">⭐ 流れ星</span>' : ''}
          </div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading posts:', error);
    postList.innerHTML = '<div class="loading">エラーが発生しました</div>';
  }
}

// 日付フォーマット
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

// HTMLエスケープ
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

// 投稿詳細ページへ遷移
function viewPostDetail(postId) {
  window.location.href = `9-mypost.html?post_id=${postId}`;
}

// ページ読み込み時に投稿を取得
loadMyPosts();