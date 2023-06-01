require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const pool = require('./config/db');

app.use(express.json());

function generateToken(email) {
  const secretKey = process.env.SECRET;
  const expiresIn = '1h';

  const payload = { email };

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return token;
}

const userRoutes = require('./routes/user/user');
const todoRoutes = require('./routes/todos/todos');

const { authenticateToken } = require('./middleware/auth');

app.use('/user', authenticateToken, userRoutes);
app.use('/todos', authenticateToken, todoRoutes);

app.get('/user', (req, res) => {
  console.log('Authorization header:', req.headers.authorization);
  res.send('User route');
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ msg: 'No token, authorization denied' });
  } else {
    next(err);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === 'malo@coet.com' && password === 'nutynuxxy') {
      const token = generateToken(email);
      res.json({ token });
    } else {
      res.status(401).json({ msg: 'Invalid Credentials' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

app.post('/register', (req, res) => {
  const { email, password, name, firstname } = req.body;

  pool.query('SELECT * FROM user WHERE email = ?', [email], (err, result) => {
    if (err) {
      console.error('Error executing database query: ' + err.stack);
      res.status(500).json({ msg: 'Internal server error' });
      return;
    }

    if (result.length > 0) {
      res.json({ msg: 'Account already exists' });
      return;
    }

    pool.query(
      'INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)',
      [email, password, name, firstname],
      (err, result) => {
        if (err) {
          console.error('Error executing database query: ' + err.stack);
          res.status(500).json({ msg: 'Internal server error' });
          return;
        }

        const token = generateToken(email);

        res.json({ token });
      }
    );
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ msg: 'Internal server error' });
});

const PORT = 3000;

pool.query('SELECT 1', (err, result) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }

  console.log('Connected to the database');

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});