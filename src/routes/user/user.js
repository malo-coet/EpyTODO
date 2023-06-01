const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

router.get('/user', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userData.id;
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
    res.send('User route');
  } catch (err) {
    next(err);
  }
});

router.get('/user/todos', verifyToken, async (req, res, next) => {
  try {
    const userId = req.userData.id;

    const [rows] = await pool.execute('SELECT * FROM todos WHERE user_id = ?', [userId]);
    const todos = rows;

    res.json(todos);
  } catch (err) {
    next(err);
  }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/users/:email', async (req, res, next) => {
  try {
    const { email } = req.params;

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});


router.get('/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? OR email = ?', [identifier, identifier]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, password, name, firstname } = req.body;

    await pool.execute(
      'UPDATE users SET email = ?, password = ?, name = ?, firstname = ? WHERE id = ?',
      [email, password, name, firstname, id]
    );

    res.json({ msg: 'User information updated' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({ msg: `User with ID ${id} deleted` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;