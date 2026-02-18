// 月齢計算ユーティリティ

// 月齢を計算する関数
function getMoonPhase(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 月齢計算（簡易版）
  let age = ((year - 2000) * 12.368266 + (month - 1) * 1.031094 + day * 0.033696) % 29.530588;
  
  // 月の相を判定
  if (age < 1.84566) {
    return { 
      phase: 'new', 
      name: '新月', 
      emoji: '🌑',
      isNewMoon: true,
      isFullMoon: false
    };
  }
  if (age < 5.53699) {
    return { 
      phase: 'waxing-crescent', 
      name: '三日月', 
      emoji: '🌒',
      isNewMoon: false,
      isFullMoon: false
    };
  }
  if (age < 9.22831) {
    return { 
      phase: 'first-quarter', 
      name: '上弦の月', 
      emoji: '🌓',
      isNewMoon: false,
      isFullMoon: false
    };
  }
  if (age < 12.91963) {
    return { 
      phase: 'waxing-gibbous', 
      name: '十三夜月', 
      emoji: '🌔',
      isNewMoon: false,
      isFullMoon: false
    };
  }
  if (age < 16.61096) {
    return { 
      phase: 'full', 
      name: '満月', 
      emoji: '🌕',
      isNewMoon: false,
      isFullMoon: true
    };
  }
  if (age < 20.30228) {
    return { 
      phase: 'waning-gibbous', 
      name: '寝待月', 
      emoji: '🌖',
      isNewMoon: false,
      isFullMoon: false
    };
  }
  if (age < 23.99361) {
    return { 
      phase: 'last-quarter', 
      name: '下弦の月', 
      emoji: '🌗',
      isNewMoon: false,
      isFullMoon: false
    };
  }
  if (age < 27.68493) {
    return { 
      phase: 'waning-crescent', 
      name: '有明月', 
      emoji: '🌘',
      isNewMoon: false,
      isFullMoon: false
    };
  }
  
  return { 
    phase: 'new', 
    name: '新月', 
    emoji: '🌑',
    isNewMoon: true,
    isFullMoon: false
  };
}

// 次の満月の日付を計算
function getNextFullMoon(fromDate = new Date()) {
  const currentMoon = getMoonPhase(fromDate);
  
  // 今日が満月なら今日を返す
  if (currentMoon.isFullMoon) {
    return fromDate;
  }
  
  // 最大30日先まで探す
  for (let i = 1; i <= 30; i++) {
    const checkDate = new Date(fromDate);
    checkDate.setDate(checkDate.getDate() + i);
    
    const moon = getMoonPhase(checkDate);
    if (moon.isFullMoon) {
      return checkDate;
    }
  }
  
  return null;
}

// 日付をYYYY-MM-DD形式に変換
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

module.exports = {
  getMoonPhase,
  getNextFullMoon,
  formatDate
};