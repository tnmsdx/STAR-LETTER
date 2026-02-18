const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// プロフィール更新
router.put('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { username, gender, birthday, notification } = req.body;

  try {
    await db.query(
      'UPDATE users SET username = ?, gender = ?, birthday = ?, notification = ? WHERE id = ?',
      [username, gender, birthday, notification || false, userId]
    );

    res.json({ message: 'プロフィールを更新しました' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'プロフィールの更新に失敗しました' });
  }
});

// フォロー中のユーザー一覧（/:userId より前に配置）
router.get('/following', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [users] = await db.query(`
      SELECT u.id, u.username, u.gender
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json(users);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'フォロー中のユーザー取得に失敗しました' });
  }
});

// フォロワー一覧（/:userId より前に配置）
router.get('/followers', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [users] = await db.query(`
      SELECT u.id, u.username, u.gender
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    res.json(users);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'フォロワー取得に失敗しました' });
  }
});

// 特定ユーザーの情報取得（具体的なルートの後に配置）
router.get('/:userId', authenticateToken, async (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.userId;

  try {
    // ユーザー情報を取得
    const [users] = await db.query(
      'SELECT id, username, email, gender, birthday, created_at FROM users WHERE id = ?',
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    const user = users[0];

    // フォロー状態を確認
    const [follows] = await db.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [currentUserId, targetUserId]
    );

    const isFollowing = follows.length > 0;

    res.json({
      user: user,
      is_following: isFollowing
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'ユーザー情報の取得に失敗しました' });
  }
});

// フォロー/アンフォロー
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  const targetUserId = req.params.userId;
  const currentUserId = req.user.userId;

  // 自分自身をフォローできないようにする
  if (currentUserId == targetUserId) {
    return res.status(400).json({ error: '自分自身をフォローすることはできません' });
  }

  try {
    // 既にフォローしているか確認
    const [existingFollows] = await db.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [currentUserId, targetUserId]
    );

    if (existingFollows.length > 0) {
      // フォロー解除
      await db.query(
        'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
        [currentUserId, targetUserId]
      );
      res.json({ message: 'フォローを解除しました', is_following: false });
    } else {
      // フォロー追加
      await db.query(
        'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
        [currentUserId, targetUserId]
      );
      res.json({ message: 'フォローしました', is_following: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'フォロー操作に失敗しました' });
  }
});

// アカウント削除
router.delete('/account', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    // トランザクション開始
    await db.query('START TRANSACTION');

    // ユーザーの投稿に紐づくコメントを削除
    await db.query(`
      DELETE FROM comments 
      WHERE post_id IN (SELECT id FROM posts WHERE user_id = ?)
    `, [userId]);

    // ユーザーが送信したコメントを削除
    await db.query('DELETE FROM comments WHERE user_id = ?', [userId]);

    // ユーザーの星の光を削除
    await db.query('DELETE FROM star_lights WHERE user_id = ?', [userId]);

    // ユーザーの投稿を削除
    await db.query('DELETE FROM posts WHERE user_id = ?', [userId]);

    // フォロー関係を削除
    await db.query('DELETE FROM follows WHERE follower_id = ? OR following_id = ?', [userId, userId]);

    // ユーザーアカウントを削除
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    // トランザクションをコミット
    await db.query('COMMIT');

    res.json({ message: 'アカウントを削除しました' });
  } catch (error) {
    // エラーが発生した場合はロールバック
    await db.query('ROLLBACK');
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'アカウントの削除に失敗しました' });
  }
});

module.exports = router;