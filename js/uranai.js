// 星座データ
const ZODIAC_DATA = {
  aries: { name: 'おひつじ座',  dates: '3/21-4/19' },
  taurus: { name: 'おうし座',  dates: '4/20-5/20' },
  gemini: { name: 'ふたご座',  dates: '5/21-6/21' },
  cancer: { name: 'かに座',  dates: '6/22-7/22' },
  leo: { name: 'しし座',  dates: '7/23-8/22' },
  virgo: { name: 'おとめ座',  dates: '8/23-9/22' },
  libra: { name: 'てんびん座',  dates: '9/23-10/23' },
  scorpio: { name: 'さそり座',  dates: '10/24-11/22' },
  sagittarius: { name: 'いて座',  dates: '11/23-12/21' },
  capricorn: { name: 'やぎ座',  dates: '12/22-1/19' },
  aquarius: { name: 'みずがめ座',  dates: '1/20-2/18' },
  pisces: { name: 'うお座',  dates: '2/19-3/20' }
};

// 生年月日から星座を判定
function getZodiacFromBirthday(birthday) {
  if (!birthday) return null;

  const date = new Date(birthday);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return 'gemini';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return 'libra';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return 'scorpio';
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';

  return null;
}

// 戻るボタン
function goBack() {
  window.location.href = '5-home.html';
}

// 設定ページへ移動
function goToSettings() {
  window.location.href = '11-settings.html';
}

// 星の数を表示
function getStarsDisplay(rank) {
  if (rank <= 5) return '★★★★★';
  if (rank <= 8) return '★★★★☆';
  if (rank <= 10) return '★★★☆☆';
  return '★★☆☆☆';
}

// 今日の日付を表示
function displayTodayDate() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  document.getElementById('todayDate').textContent = dateStr;
}

// ユーザー情報を取得（getCurrentUser関数の代替）
async function getUserInfo() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('ログインが必要です');
    }

    const response = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('ユーザー情報の取得に失敗しました');
    }

    return await response.json();
  } catch (error) {
    console.error('getUserInfo error:', error);
    throw error;
  }
}

// 占い情報を読み込み
async function loadFortune() {
  const loadingSection = document.getElementById('loadingSection');
  const fortuneSection = document.getElementById('fortuneSection');
  const noZodiacSection = document.getElementById('noZodiacSection');
  const errorSection = document.getElementById('errorSection');

  // すべて非表示
  loadingSection.style.display = 'none';
  fortuneSection.style.display = 'none';
  noZodiacSection.style.display = 'none';
  errorSection.style.display = 'none';

  // ローディング表示
  loadingSection.style.display = 'block';

  try {
    console.log('ユーザー情報を取得中...');
    const user = await getUserInfo();
    console.log('ユーザー情報:', user);

    if (!user.birthday) {
      console.log('生年月日が未設定');
      loadingSection.style.display = 'none';
      noZodiacSection.style.display = 'block';
      return;
    }

    console.log('生年月日:', user.birthday);
    const zodiacSign = getZodiacFromBirthday(user.birthday);
    console.log('星座:', zodiacSign);

    if (!zodiacSign) {
      throw new Error('星座の判定に失敗しました');
    }

    console.log('占い情報を取得中...');
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/fortune/today', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '占い情報の取得に失敗しました');
    }

    const fortune = await response.json();
    console.log('占い情報:', fortune);

    // 自分の運勢を表示
    displayMyFortune(zodiacSign, fortune);

    // ランキングを表示
    displayRanking(zodiacSign, fortune.ranking);

    loadingSection.style.display = 'none';
    fortuneSection.style.display = 'block';

  } catch (error) {
    console.error('占い情報の読み込みエラー:', error);
    loadingSection.style.display = 'none';
    errorSection.style.display = 'block';
    document.getElementById('errorMessage').textContent = error.message || '占い情報の読み込みに失敗しました';
  }
}

// 自分の運勢を表示
function displayMyFortune(zodiacSign, fortune) {
  const zodiacInfo = ZODIAC_DATA[zodiacSign];
  const myFortune = fortune.ranking.find(r => r.zodiac === zodiacSign);

  if (!myFortune) {
    throw new Error('運勢情報が見つかりません');
  }

  // 星座アイコンと名前
  document.getElementById('myZodiacIcon').textContent = zodiacInfo.icon;
  document.getElementById('myZodiacName').textContent = zodiacInfo.name;

  // 順位
  document.getElementById('myRank').textContent = myFortune.rank;

  // 星の数
  document.getElementById('myStars').textContent = getStarsDisplay(myFortune.rank);

  // コメント
  document.getElementById('fortuneComment').textContent = myFortune.comment;

  // ラッキーアイテム
  document.getElementById('luckyItem').textContent = myFortune.lucky_item;

  // アドバイス
  document.getElementById('adviceText').textContent = myFortune.advice;
}

// ランキングを表示
function displayRanking(myZodiacSign, ranking) {
  const rankingList = document.getElementById('rankingList');
  rankingList.innerHTML = '';

  // ランキング順にソート
  const sortedRanking = [...ranking].sort((a, b) => a.rank - b.rank);

  sortedRanking.forEach(item => {
    const zodiacInfo = ZODIAC_DATA[item.zodiac];
    const isMyRank = item.zodiac === myZodiacSign;

    const div = document.createElement('div');
    div.className = `ranking-item ${isMyRank ? 'my-rank' : ''}`;

    div.innerHTML = `
      <div class="ranking-left">
        <span class="ranking-number">${item.rank}</span>
        <span class="ranking-zodiac">${zodiacInfo.name}</span>
      </div>
      <span class="ranking-stars">${getStarsDisplay(item.rank)}</span>
    `;

    rankingList.appendChild(div);
  });
}

// ページ読み込み時
window.addEventListener('load', async () => {
  console.log('ページ読み込み開始');

  // 認証チェック
  const token = localStorage.getItem('token');
  if (!token) {
    alert('ログインが必要です');
    window.location.href = '4-login.html';
    return;
  }

  // 今日の日付を表示
  displayTodayDate();

  // 占い情報を読み込み
  await loadFortune();
});