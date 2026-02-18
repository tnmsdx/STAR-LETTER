const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

// 今日の気分を記録
router.post('/today', async (req, res) => {
  try {
    const { mood, note } = req.body;
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    if (!mood) {
      return res.status(400).json({ error: '気分を選択してください' });
    }

    // 既存の記録があれば更新、なければ挿入
    await db.query(
      `INSERT INTO mood_calendar (user_id, record_date, mood, note) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE mood = ?, note = ?`,
      [userId, today, mood, note || null, mood, note || null]
    );

    res.json({ 
      success: true, 
      message: '今日の気分を記録しました' 
    });
  } catch (error) {
    console.error('気分記録エラー:', error);
    res.status(500).json({ error: '気分の記録に失敗しました' });
  }
});

// 今日の気分を取得（記録済みかチェック）
router.get('/today', async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const [records] = await db.query(
      `SELECT 
        id,
        user_id,
        DATE_FORMAT(record_date, '%Y-%m-%d') as record_date,
        mood,
        note,
        created_at
       FROM mood_calendar 
       WHERE user_id = ? AND record_date = ?`,
      [userId, today]
    );

    if (records.length > 0) {
      res.json({ 
        success: true, 
        recorded: true, 
        data: records[0] 
      });
    } else {
      res.json({ 
        success: true, 
        recorded: false 
      });
    }
  } catch (error) {
    console.error('気分取得エラー:', error);
    res.status(500).json({ error: '気分の取得に失敗しました' });
  }
});

// 指定月の気分記録を取得
router.get('/month/:year/:month', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month } = req.params;

    // 月の最初と最後の日付
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const [records] = await db.query(
      `SELECT 
        id,
        user_id,
        DATE_FORMAT(record_date, '%Y-%m-%d') as record_date,
        mood,
        note,
        created_at
       FROM mood_calendar 
       WHERE user_id = ? 
       AND record_date BETWEEN ? AND ?
       ORDER BY record_date`,
      [userId, startDate, endDate]
    );

    res.json({ 
      success: true, 
      data: records 
    });
  } catch (error) {
    console.error('月間気分取得エラー:', error);
    res.status(500).json({ error: '気分の取得に失敗しました' });
  }
});

// 特定の日付の気分を取得
router.get('/date/:date', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.params;

    const [records] = await db.query(
      `SELECT 
        id,
        user_id,
        DATE_FORMAT(record_date, '%Y-%m-%d') as record_date,
        mood,
        note,
        created_at
       FROM mood_calendar 
       WHERE user_id = ? AND record_date = ?`,
      [userId, date]
    );

    if (records.length > 0) {
      res.json({ 
        success: true, 
        data: records[0] 
      });
    } else {
      res.json({ 
        success: true, 
        data: null 
      });
    }
  } catch (error) {
    console.error('気分取得エラー:', error);
    res.status(500).json({ error: '気分の取得に失敗しました' });
  }
});

module.exports = router;