// 認証チェック
requireAuth();

let currentTab = 'inbox';

// タブ切り替え
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    loadMessages();
  });
});

// メッセージ読み込み
async function loadMessages() {
  const messageListEl = document.getElementById('messageList');
  messageListEl.innerHTML = '<div class="loading">読み込み中...</div>';
  
  try {
    const token = getToken();
    const endpoint = currentTab === 'inbox' ? '/api/messages/inbox' : '/api/messages/sent';
    
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const messages = await response.json();
      
      if (messages.length > 0) {
        messageListEl.innerHTML = messages.map(msg => {
          const date = new Date(msg.created_at);
          const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
          const unreadClass = !msg.is_read && currentTab === 'inbox' ? 'unread' : '';
          const fromTo = currentTab === 'inbox' ? msg.from_username : msg.to_username;
          
          return `
            <div class="message-item ${unreadClass}" onclick="viewMessage(${msg.id})">
              <div class="post-author">${fromTo}</div>
              <div class="post-content">${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}</div>
              <div class="post-date">${dateStr}${!msg.is_read && currentTab === 'inbox' ? ' · 未読' : ''}</div>
            </div>
          `;
        }).join('');
      } else {
        messageListEl.innerHTML = '<div class="loading">メッセージがありません</div>';
      }
    } else {
      messageListEl.innerHTML = '<div class="loading">メッセージの取得に失敗しました</div>';
    }
  } catch (error) {
    console.error('Load messages error:', error);
    messageListEl.innerHTML = '<div class="loading">メッセージの取得に失敗しました</div>';
  }
}

function viewMessage(messageId) {
  // メッセージ詳細ページへ遷移（将来実装）
  alert('メッセージID: ' + messageId);
}

// 初期読み込み
loadMessages();