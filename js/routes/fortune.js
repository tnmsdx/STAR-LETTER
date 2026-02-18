const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// 12星座のリスト
const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

// 今日の日付（YYYY-MM-DD形式）
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 占いデータを生成（ダミーデータ）
function generateFortune() {
  const comments = [
    '今日は素晴らしい一日になるでしょう。新しいチャンスが訪れる予感です。',
    '少し慎重に行動すると良い日です。焦らず、じっくり考えましょう。',
    '人間関係が良好な一日。大切な人との会話を楽しんでください。',
    '仕事運が上昇中！積極的に挑戦してみましょう。',
    '健康に気をつけて。無理をせず、休息を取ることも大切です。',
    '金運が好調です。思わぬ収入があるかもしれません。',
    '創造性が高まる日。新しいアイデアが浮かびそうです。',
    '周囲の人に感謝の気持ちを伝えると、さらに運気がアップします。',
    '直感が冴える日。自分の感覚を信じて行動しましょう。',
    '変化を恐れずに。新しい環境があなたを成長させます。',
    'コミュニケーション運が最高！積極的に話しかけてみて。',
    '今日は自分磨きの日。新しいことを学んでみるのも良いでしょう。'
  ];

  const luckyItems = [
    '青いペン', '白いハンカチ', 'ミントキャンディ', '小さな鏡',
    '赤いリボン', '星型のアクセサリー', 'ストライプ柄の靴下', 'お気に入りの本',
    'ハーブティー', 'キラキラ光るもの', 'メモ帳', '香水',
    'ピンク色のもの', 'コインケース', 'イヤホン', '緑色のもの'
  ];

  const advices = [
    '積極的に行動することで運気がアップします',
    '落ち着いて物事を進めることで良い結果が得られます',
    '周りの人への思いやりを忘れずに過ごしましょう',
    '新しいことに挑戦してみると良い発見があります',
    '今日は自分の時間を大切にしてください',
    '笑顔で過ごすことが幸運を引き寄せます',
    '感謝の気持ちを言葉にすると良いことが起こります',
    '直感を信じて決断すると良い方向に進みます',
    '小さな親切が大きな幸せを呼びます',
    'ポジティブな言葉を使うことで運気が上昇します',
    '周囲の変化を楽しむ気持ちが大切です',
    '自分らしさを大切にすることで道が開けます'
  ];

  // ランダムにシャッフル
  const shuffledSigns = [...ZODIAC_SIGNS].sort(() => Math.random() - 0.5);

  const ranking = shuffledSigns.map((zodiac, index) => ({
    zodiac,
    rank: index + 1,
    comment: comments[index],
    lucky_item: luckyItems[index],
    advice: advices[index]
  }));

  return ranking;
}

// 今日の占いを取得（キャッシュ機能付き）
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = getTodayDate();

    // データベースから今日の占いを検索
    const [existing] = await db.query(
      'SELECT * FROM fortunes WHERE fortune_date = ? ORDER BY id DESC LIMIT 1',
      [today]
    );

    let fortuneData;

    if (existing.length > 0) {
      // 既存の占いデータを使用
      const rawData = existing[0].data;
      
      // データが既にオブジェクトの場合はそのまま使用、文字列の場合はパース
      if (typeof rawData === 'string') {
        fortuneData = JSON.parse(rawData);
      } else {
        fortuneData = rawData;
      }
      
      console.log('既存の占いデータを使用');
    } else {
      // 新しい占いデータを生成
      fortuneData = generateFortune();
      console.log('新しい占いデータを生成');

      // データベースに保存
      await db.query(
        'INSERT INTO fortunes (fortune_date, data) VALUES (?, ?)',
        [today, JSON.stringify(fortuneData)]
      );
    }

    res.json({
      date: today,
      ranking: fortuneData
    });

  } catch (error) {
    console.error('占い取得エラー:', error);
    res.status(500).json({ error: '占い情報の取得に失敗しました' });
  }
});

// 占いデータを手動で再生成（管理者用）
router.post('/regenerate', authenticateToken, async (req, res) => {
  try {
    const today = getTodayDate();

    // 新しい占いデータを生成
    const fortuneData = generateFortune();

    // 既存データを削除
    await db.query('DELETE FROM fortunes WHERE fortune_date = ?', [today]);

    // 新しいデータを保存
    await db.query(
      'INSERT INTO fortunes (fortune_date, data) VALUES (?, ?)',
      [today, JSON.stringify(fortuneData)]
    );

    res.json({
      success: true,
      message: '占いデータを再生成しました',
      ranking: fortuneData
    });

  } catch (error) {
    console.error('占い再生成エラー:', error);
    res.status(500).json({ error: '占いデータの再生成に失敗しました' });
  }
});

module.exports = router;