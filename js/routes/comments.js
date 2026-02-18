const express = require('express');
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// 投稿IDでコメント一覧取得
router.get('/post/:postId', async (req, res) => {
  const postId = req.params.postId;
  
  try {
    const [comments] = await db.query(`
      SELECT c.*, u.username 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.post_id = ? 
      ORDER BY c.created_at DESC
    `, [postId]);
    
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'コメントの取得に失敗しました' });
  }
});

// コメント投稿
router.post('/', async (req, res) => {
  const userId = req.user.userId;
  const { post_id, content } = req.body;
  
  try {
    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'コメント内容を入力してください' });
    }
    
    if (!post_id) {
      return res.status(400).json({ error: '投稿IDが指定されていません' });
    }
    
    const [result] = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [post_id, userId, content]
    );
    
    res.json({ 
      message: 'コメントを投稿しました',
      commentId: result.insertId 
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'コメントの投稿に失敗しました' });
  }
});

// 受信したコメント一覧（自分の投稿に対するコメント）
router.get('/received', async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const [comments] = await db.query(`
      SELECT 
        c.id as comment_id,
        c.content as comment_content,
        c.created_at as comment_date,
        c.post_id,
        p.content as post_content,
        u.username as commenter_name
      FROM comments c
      JOIN posts p ON c.post_id = p.id
      JOIN users u ON c.user_id = u.id
      WHERE p.user_id = ? AND c.user_id != ?
      ORDER BY c.created_at DESC
    `, [userId, userId]);
    
    res.json(comments);
  } catch (error) {
    console.error('Get received comments error:', error);
    res.status(500).json({ error: 'コメントの取得に失敗しました' });
  }
});

// 送信したコメント一覧（自分が他人の投稿にしたコメント）
router.get('/sent', async (req, res) => {
  const userId = req.user.userId;
  
  try {
    const [comments] = await db.query(`
      SELECT 
        c.id as comment_id,
        c.content as comment_content,
        c.created_at as comment_date,
        c.post_id,
        p.content as post_content,
        p.user_id as post_owner_id,
        u.username as post_owner_name
      FROM comments c
      JOIN posts p ON c.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE c.user_id = ? AND p.user_id != ?
      ORDER BY c.created_at DESC
    `, [userId, userId]);
    
    res.json(comments);
  } catch (error) {
    console.error('Get sent comments error:', error);
    res.status(500).json({ error: 'コメントの取得に失敗しました' });
  }
});

module.exports = router;