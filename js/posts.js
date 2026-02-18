// 投稿一覧取得
async function getPosts() {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      // APIが { posts: [...] } 形式で返す場合に対応
      const posts = result.posts || result;
      return { success: true, data: posts };
    } else {
      return { success: false, error: '投稿の取得に失敗しました' };
    }
  } catch (error) {
    console.error('Get posts error:', error);
    return { success: false, error: '投稿の取得に失敗しました' };
  }
}

// 投稿詳細取得
async function getPost(postId) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const post = await response.json();
      return { success: true, data: post };
    } else {
      return { success: false, error: '投稿の取得に失敗しました' };
    }
  } catch (error) {
    console.error('Get post error:', error);
    return { success: false, error: '投稿の取得に失敗しました' };
  }
}

// 投稿作成
async function createPost(postData) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Create post error:', error);
    return { success: false, error: '投稿に失敗しました' };
  }
}

// ランダム投稿取得
async function getRandomPost() {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/posts/random/daily`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const post = await response.json();
      return { success: true, data: post };
    } else {
      return { success: false, error: '投稿の取得に失敗しました' };
    }
  } catch (error) {
    console.error('Get random post error:', error);
    return { success: false, error: 'ランダム投稿の取得に失敗しました' };
  }
}

// 自分の投稿一覧取得
async function getMyPosts() {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/posts/my-posts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const posts = await response.json();
      return { success: true, data: posts };
    } else {
      return { success: false, error: '投稿の取得に失敗しました' };
    }
  } catch (error) {
    console.error('Get my posts error:', error);
    return { success: false, error: '投稿の取得に失敗しました' };
  }
}

// 投稿削除
async function deletePost(postId) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Delete post error:', error);
    return { success: false, error: '投稿の削除に失敗しました' };
  }
}

// コメント一覧取得
async function getComments(postId) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const comments = await response.json();
      return { success: true, data: comments };
    } else {
      return { success: false, error: 'コメントの取得に失敗しました' };
    }
  } catch (error) {
    console.error('Get comments error:', error);
    return { success: false, error: 'コメントの取得に失敗しました' };
  }
}

// コメント投稿
async function createComment(postId, content) {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ post_id: postId, content })
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('Create comment error:', error);
    return { success: false, error: 'コメントの投稿に失敗しました' };
  }
}

// 今日の投稿数を取得
async function getTodayPostCount() {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/posts/today-count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, count: result.count };
    } else {
      return { success: false, count: 0 };
    }
  } catch (error) {
    console.error('Get today post count error:', error);
    return { success: false, count: 0 };
  }
}