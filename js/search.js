// 認証チェック
requireAuth();

// 検索ボタン
document.getElementById('searchBtn').addEventListener('click', performSearch);

// Enterキーでも検索
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

async function performSearch() {
  const keyword = document.getElementById('searchInput').value.trim();
  const resultsEl = document.getElementById('searchResults');
  
  if (!keyword) {
    resultsEl.innerHTML = '<p class="search-placeholder">キーワードを入力してください</p>';
    return;
  }
  
  resultsEl.innerHTML = '<div class="loading">検索中...</div>';
  
  try {
    const result = await getPosts();
    
    if (result.success && result.data.length > 0) {
      // キーワードでフィルタリング
      const filtered = result.data.filter(post => 
        post.content.includes(keyword) || 
        (post.title && post.title.includes(keyword))
      );
      
      if (filtered.length > 0) {
        resultsEl.innerHTML = filtered.map(post => {
          const date = new Date(post.created_at);
          const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
          
          return `
            <div class="post-item" onclick="viewPost(${post.id})">
              <div class="post-author">${post.is_anonymous ? '匿名' : post.username}</div>
              <div class="post-content">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</div>
              <div class="post-date">${dateStr} · コメント ${post.comment_count || 0}件</div>
            </div>
          `;
        }).join('');
      } else {
        resultsEl.innerHTML = '<p class="search-placeholder">検索結果が見つかりませんでした</p>';
      }
    } else {
      resultsEl.innerHTML = '<p class="search-placeholder">投稿がありません</p>';
    }
  } catch (error) {
    console.error('Search error:', error);
    resultsEl.innerHTML = '<p class="search-placeholder">検索に失敗しました</p>';
  }
}

function viewPost(postId) {
  window.location.href = `7-detail.html?id=${postId}`;
}