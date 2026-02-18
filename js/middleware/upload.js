const multer = require('multer');
const path = require('path');
const fs = require('fs');

// フォルダが存在しない場合は作成
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 フォルダを作成しました: ${dirPath}`);
  }
};

// uploadsフォルダとサブフォルダを作成
ensureDirectoryExists('uploads');
ensureDirectoryExists('uploads/images');
ensureDirectoryExists('uploads/videos');

// ストレージ設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // ファイルタイプに応じて保存先を変更
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images/');
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, 'uploads/videos/');
    } else {
      cb(new Error('サポートされていないファイル形式です'), false);
    }
  },
  filename: function (req, file, cb) {
    // ファイル名: タイムスタンプ + オリジナルのファイル名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// ファイルフィルター（画像と動画のみ許可）
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('画像または動画ファイルのみアップロード可能です'), false);
  }
};

// multer設定
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 最大50MB
  }
});

module.exports = upload;