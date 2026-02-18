const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./js/routes/auth');
const postsRoutes = require('./js/routes/posts');
const commentsRoutes = require('./js/routes/comments');
const usersRoutes = require('./js/routes/users');
const fortuneRoutes = require('./js/routes/fortune'); 
const moodRoutes = require('./js/routes/mood');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ★ この1行を追加（画像・動画を公開）★
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/fortune', fortuneRoutes);
app.use('/api/mood', moodRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '0-welcome.html'));
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('✨ 星の手紙サーバーが起動しました!');
  console.log(`🌐 サーバー: http://localhost:${PORT}`);
  console.log('========================================');
});