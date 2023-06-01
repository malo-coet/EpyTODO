const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

router.get('/todos', async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM todos');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/todos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute('SELECT * FROM todos WHERE id = ?', [id]);
    const todo = rows[0];

    if (!todo) {
      return res.status(404).json({ msg: 'Todo not found' });
    }

    res.json(todo);
  } catch (err) {
    next(err);
  }
});

router.post('/todos', async (req, res, next) => {
  try {
    const { title, description, due_time, user_id, status } = req.body;

    await pool.execute(
      'INSERT INTO todos (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)',
      [title, description, due_time, user_id, status]
    );

    res.json({ msg: 'Todo created' });
  } catch (err) {
    next(err);
  }
});

router.put('/todos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, due_time, status } = req.body;

    await pool.execute(
      'UPDATE todos SET title = ?, description = ?, due_time = ?, status = ? WHERE id = ?',
      [title, description, due_time, status, id]
    );

    res.json({ msg: 'Todo updated' });
  } catch (err) {
    next(err);
  }
});

router.delete('/todos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM todos WHERE id = ?', [id]);

    res.json({ msg: `Todo with ID ${id} deleted` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;