const API_BASE_URL = 'http://localhost:3000/api';

// トークンを保存
function saveToken(token) {
  localStorage.setItem('token', token);
}

// トークンを取得
function getToken() {
  return localStorage.getItem('token');
}

// ユーザー情報を保存
function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// ユーザー情報を取得
function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// ログイン状態をチェック
function isLoggedIn() {
  return !!getToken();
}

// 認証が必要なページで使用
function requireAuth() {
  if (!isLoggedIn()) {
    alert('ログインが必要です');
    window.location.href = '4-login.html';
    return false;
  }
  return true;
}

// 新規登録
async function register(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      saveToken(data.token);
      saveUser(data.user);
      return { success: true, data };
    } else {
      return { success: false, error: data.error || '登録に失敗しました' };
    }
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: 'ネットワークエラーが発生しました' };
  }
}

// ログイン
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      saveToken(data.token);
      saveUser(data.user);
      return { success: true, data };
    } else {
      return { success: false, error: data.error || 'ログインに失敗しました' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'ネットワークエラーが発生しました' };
  }
}

// ログアウト
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// 現在のユーザー情報を取得（サーバーから最新情報を取得）
async function getCurrentUser() {
  const token = getToken();
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // サーバーからの取得に失敗した場合、ローカルストレージから取得
      return getUser();
    }

    const data = await response.json();
    saveUser(data); // 最新情報を保存
    return data;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    // エラーの場合もローカルストレージから取得
    return getUser();
  }
}