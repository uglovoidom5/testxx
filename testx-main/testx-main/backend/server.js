const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8001;
const JWT_SECRET = process.env.JWT_SECRET || 'cloudtype-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Initialize SQLite database
const db = new sqlite3.Database('./cloudtype.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar TEXT,
    verified BOOLEAN DEFAULT 0,
    admin BOOLEAN DEFAULT 0,
    banned_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Posts table
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    reply_to TEXT,
    repost_of TEXT,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    reposts_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (reply_to) REFERENCES posts (id),
    FOREIGN KEY (repost_of) REFERENCES posts (id)
  )`);

  // Likes table
  db.run(`CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (post_id) REFERENCES posts (id)
  )`);

  // Follows table
  db.run(`CREATE TABLE IF NOT EXISTS follows (
    id TEXT PRIMARY KEY,
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users (id),
    FOREIGN KEY (following_id) REFERENCES users (id)
  )`);

  // Create admin user
  createAdminUser();
}

// Create admin user
function createAdminUser() {
  const adminPassword = bcrypt.hashSync('adminsky', 10);
  const adminId = uuidv4();
  
  db.run(`INSERT OR IGNORE INTO users (id, username, email, password, display_name, admin, verified) 
          VALUES (?, ?, ?, ?, ?, 1, 1)`, 
    [adminId, 'admin', 'admin@cloudtype.local', adminPassword, 'Administrator'],
    function(err) {
      if (err) {
        console.log('Admin user might already exist');
      } else if (this.changes > 0) {
        console.log('Admin user created successfully');
      }
    }
  );
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user.admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// AUTH ROUTES
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      return res.status(403).json({ error: 'Account is banned' });
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ 
        id: user.id, 
        username: user.username, 
        admin: user.admin,
        verified: user.verified 
      }, JWT_SECRET);
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          display_name: user.display_name,
          email: user.email,
          bio: user.bio,
          avatar: user.avatar,
          verified: user.verified,
          admin: user.admin
        } 
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, display_name } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = uuidv4();

  db.run(`INSERT INTO users (id, username, email, password, display_name) VALUES (?, ?, ?, ?, ?)`,
    [userId, username, email, hashedPassword, display_name || username],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Registration failed' });
      }

      const token = jwt.sign({ 
        id: userId, 
        username, 
        admin: false,
        verified: false 
      }, JWT_SECRET);
      
      res.status(201).json({ 
        token, 
        user: { 
          id: userId, 
          username, 
          display_name: display_name || username,
          email,
          verified: false,
          admin: false
        } 
      });
    }
  );
});

// USER ROUTES
app.get('/api/users/me', authenticateToken, (req, res) => {
  db.get('SELECT id, username, email, display_name, bio, avatar, verified, admin FROM users WHERE id = ?', 
    [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(user);
  });
});

app.get('/api/users/:username', (req, res) => {
  db.get(`SELECT id, username, display_name, bio, avatar, verified, 
                 (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers_count,
                 (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following_count,
                 (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as posts_count
          FROM users WHERE username = ?`, 
    [req.params.username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// ADMIN ROUTES
app.post('/api/admin/ban-user', authenticateToken, requireAdmin, (req, res) => {
  const { username, duration } = req.body; // duration in hours, 0 for permanent
  
  let banned_until = null;
  if (duration > 0) {
    banned_until = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();
  }

  db.run('UPDATE users SET banned_until = ? WHERE username = ?', 
    [banned_until, username], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User banned successfully' });
  });
});

app.post('/api/admin/unban-user', authenticateToken, requireAdmin, (req, res) => {
  const { username } = req.body;

  db.run('UPDATE users SET banned_until = NULL WHERE username = ?', 
    [username], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User unbanned successfully' });
  });
});

app.post('/api/admin/verify-user', authenticateToken, requireAdmin, (req, res) => {
  const { username, verified } = req.body;

  db.run('UPDATE users SET verified = ? WHERE username = ?', 
    [verified ? 1 : 0, username], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User verification updated successfully' });
  });
});

app.post('/api/admin/make-admin', authenticateToken, requireAdmin, (req, res) => {
  const { username, admin } = req.body;

  db.run('UPDATE users SET admin = ? WHERE username = ?', 
    [admin ? 1 : 0, username], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User admin status updated successfully' });
  });
});

app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  db.all(`SELECT id, username, display_name, email, verified, admin, banned_until, created_at 
          FROM users ORDER BY created_at DESC`, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

// POST ROUTES
app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
  const { content, reply_to, repost_of } = req.body;
  const postId = uuidv4();
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(`INSERT INTO posts (id, user_id, content, image, reply_to, repost_of) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    [postId, req.user.id, content, image, reply_to, repost_of],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create post' });
      }
      res.status(201).json({ id: postId, message: 'Post created successfully' });
    }
  );
});

app.get('/api/posts/feed', authenticateToken, (req, res) => {
  const limit = req.query.limit || 20;
  const offset = req.query.offset || 0;

  db.all(`SELECT posts.*, users.username, users.display_name, users.avatar, users.verified,
                 (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as likes_count,
                 (SELECT COUNT(*) FROM posts AS replies WHERE replies.reply_to = posts.id) as replies_count,
                 (SELECT COUNT(*) FROM posts AS reposts WHERE reposts.repost_of = posts.id) as reposts_count,
                 (SELECT COUNT(*) > 0 FROM likes WHERE post_id = posts.id AND user_id = ?) as liked_by_user
          FROM posts 
          JOIN users ON posts.user_id = users.id 
          WHERE posts.reply_to IS NULL
          ORDER BY posts.created_at DESC 
          LIMIT ? OFFSET ?`,
    [req.user.id, limit, offset], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(posts);
  });
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const likeId = uuidv4();
  
  db.run('INSERT OR IGNORE INTO likes (id, user_id, post_id) VALUES (?, ?, ?)',
    [likeId, req.user.id, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Post liked successfully' });
  });
});

app.delete('/api/posts/:id/like', authenticateToken, (req, res) => {
  db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?',
    [req.user.id, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Post unliked successfully' });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cloudtype API server running on port ${PORT}`);
});