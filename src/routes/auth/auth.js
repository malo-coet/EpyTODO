const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

router.post('/register', (req, res) => {
  const { email, name, firstname, password } = req.body;

  pool.query('SELECT * FROM user WHERE email = ?', [email], (error, results) => {
    if (error) {
      console.error('Error executing database query:', error);
      return res.status(500).json({ msg: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.status(409).json({ msg: 'Account already exists' });
    }

    bcrypt.hash(password, 10, (hashError, hashedPassword) => {
      if (hashError) {
        console.error('Error hashing password:', hashError);
        return res.status(500).json({ msg: 'Internal server error' });
      }

      pool.query(
        'INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, firstname],
        (insertError, insertResult) => {
          if (insertError) {
            console.error('Error inserting new user:', insertError);
            return res.status(500).json({ msg: 'Internal server error' });
          }

          const token = jwt.sign({ email, name, firstname }, process.env.JWT_SECRET);
          res.status(200).json({ token });
        }
      );
    });
  });
});

module.exports = router;