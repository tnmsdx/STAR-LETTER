const express = require('express');
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.use(authenticateToken);

// 投稿作成（画像・動画対応）
router.post('/', upload.single('media'), async (req, res) => {
  const { content, letter_type, is_anonymous, is_shooting_star } = req.body;
  const userId = req.user.userId;

  try {
    if (!content && !req.file) {
      return res.status(400).json({ error: '内容または画像/動画が必要です' });
    }

    // FormDataから来る値を適切に変換
    const isAnonymous = is_anonymous === 'true' || is_anonymous === true ? 1 : 0;
    const isShootingStar = is_shooting_star === 'true' || is_shooting_star === true ? 1 : 0;

    // アップロードされたファイルの情報
    let mediaType = null;
    let mediaUrl = null;
    
    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) {
        mediaType = 'image';
      } else if (req.file.mimetype.startsWith('video/')) {
        mediaType = 'video';
      }
      // ファイルパスを保存
      mediaUrl = req.file.path.replace(/\\/g, '/');
    }

    // 流れ星モードの場合、24時間後の日時を設定
    const expiresAt = isShootingStar ?
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ') :
      null;

    const [result] = await db.query(
      'INSERT INTO posts (user_id, content, letter_type, is_anonymous, is_shooting_star, expires_at, media_type, media_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, content || '', letter_type || 'public', isAnonymous, isShootingStar, expiresAt, mediaType, mediaUrl]
    );

    res.status(201).json({ 
      message: '投稿しました', 
      postId: result.insertId,
      mediaType: mediaType,
      mediaUrl: mediaUrl
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 投稿一覧取得
router.get('/', async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const [posts] = await db.query(`
      SELECT 
        p.id,
        p.user_id,
        p.content, 
        p.letter_type, 
        p.created_at, 
        p.is_anonymous,
        p.is_shooting_star,
        p.media_type,
        p.media_url,
        u.username, 
        u.gender,
        (SELECT COUNT(*) FROM star_lights WHERE post_id = p.id) as light_count,
        (SELECT COUNT(*) > 0 FROM star_lights WHERE post_id = p.id AND user_id = ?) as is_lighted
      FROM posts p 
      JOIN users u ON p.user_id = u.id
      WHERE p.is_public = TRUE 
        AND (p.expires_at IS NULL OR p.expires_at > NOW())
      ORDER BY p.created_at DESC
    `, [userId]);
    
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 自分の投稿一覧を取得（/:id より前に配置 - 重要！）
router.get('/my-posts', async (req, res) => {
  const userId = req.user.userId;

  try {
    const [posts] = await db.query(`
      SELECT id, content, is_anonymous, is_shooting_star, media_type, media_url, created_at, expires_at
      FROM posts
      WHERE user_id = ?
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
    `, [userId]);

    res.json(posts);
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 今日の自分の投稿数を取得
router.get('/today-count', async (req, res) => {
  const userId = req.user.userId;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [result] = await db.query(`
      SELECT COUNT(*) as count
      FROM posts
      WHERE user_id = ?
        AND created_at >= ?
        AND created_at < ?
    `, [userId, today, tomorrow]);

    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Get today count error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 特定ユーザーの投稿を取得（/:id より前に配置）
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [posts] = await db.query(`
      SELECT 
        p.*,
        u.username
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
        AND (p.expires_at IS NULL OR p.expires_at > NOW())
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: '投稿の取得に失敗しました' });
  }
});

// 星の光を送る・取り消す（トグル）
router.post('/:id/light', async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;
  
  try {
    // 既に光を送っているかチェック
    const [existing] = await db.query(
      'SELECT * FROM star_lights WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );
    
    if (existing.length > 0) {
      // 既に送っている場合は削除（取り消し）
      await db.query(
        'DELETE FROM star_lights WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );
      
      // 光の数を取得
      const [count] = await db.query(
        'SELECT COUNT(*) as count FROM star_lights WHERE post_id = ?',
        [postId]
      );
      
      return res.json({ 
        message: '星の光を取り消しました',
        light_count: count[0].count,
        is_lighted: false
      });
    }
    
    // まだ送っていない場合は追加
    await db.query(
      'INSERT INTO star_lights (post_id, user_id) VALUES (?, ?)',
      [postId, userId]
    );
    
    // 光の数を取得
    const [count] = await db.query(
      'SELECT COUNT(*) as count FROM star_lights WHERE post_id = ?',
      [postId]
    );
    
    res.json({ 
      message: '星の光を送りました',
      light_count: count[0].count,
      is_lighted: true
    });
  } catch (error) {
    console.error('Send light error:', error);
    res.status(500).json({ error: '星の光の送信に失敗しました' });
  }
});

// ===== 投稿削除 =====
router.delete('/:id', async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.userId;

  try {
    // 投稿が存在し、自分の投稿であることを確認
    const [posts] = await db.query(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: '投稿が見つかりません、または削除権限がありません' });
    }

    // 関連データを先に削除
    await db.query('DELETE FROM star_lights WHERE post_id = ?', [postId]);
    await db.query('DELETE FROM comments WHERE post_id = ?', [postId]);

    // 投稿本体を削除
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({ message: '投稿を削除しました' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 投稿詳細取得（単一）- 最後に配置
router.get('/:id', async (req, res) => {
  const postId = req.params.id;
  
  try {
    const [posts] = await db.query(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
        AND (p.expires_at IS NULL OR p.expires_at > NOW())
    `, [postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    
    res.json(posts[0]);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;