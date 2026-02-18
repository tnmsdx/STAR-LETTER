// ページフェードイン
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.body.classList.add('fade-in');
  }, 100);
});

// ページ遷移時のフェードアウト
function fadeOutAndNavigate(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => {
    window.location.href = url;
  }, 800);
}

// リンククリック時にフェードアウト
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && !link.hasAttribute('target')) {
    const href = link.getAttribute('href');
    if (href && href !== '#' && !href.startsWith('javascript:')) {
      e.preventDefault();
      fadeOutAndNavigate(href);
    }
  }
});

// フォーム送信時のフェードアウト
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.tagName === 'FORM') {
    document.body.classList.add('fade-out');
  }
});