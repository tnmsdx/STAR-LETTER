const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, username, gender, birthday } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });
    }

    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'このメールアドレスは既に登録されています' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, username, gender, birthday) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, username || 'noname', gender || '秘密', birthday || null]
    );

    const token = jwt.sign({ userId: result.insertId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '登録成功',
      token,
      user: { id: result.insertId, email, username: username || 'noname', gender: gender || '秘密', birthday: birthday || null }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'ログイン成功',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username, 
        gender: user.gender,
        birthday: user.birthday,
        notification: user.notification
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 現在のユーザー情報取得
router.get('/me', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const [users] = await db.query(
      'SELECT id, username, email, gender, birthday, notification, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'ユーザー情報の取得に失敗しました' });
  }
});

// ユーザー情報更新（生年月日を含む）
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { username, birthday } = req.body;
    const userId = req.user.userId;

    // 更新内容を構築
    const updates = [];
    const values = [];

    if (username) {
      // ユーザー名の重複チェック
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'このユーザー名は既に使用されています' });
      }

      updates.push('username = ?');
      values.push(username);
    }

    if (birthday !== undefined) {
      updates.push('birthday = ?');
      values.push(birthday || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '更新する内容がありません' });
    }

    values.push(userId);

    // データベース更新
    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // 更新後のユーザー情報を取得
    const [users] = await db.query(
      'SELECT id, username, email, gender, birthday, notification, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('ユーザー情報更新エラー:', error);
    res.status(500).json({ error: 'ユーザー情報の更新に失敗しました' });
  }
});

module.exports = router;