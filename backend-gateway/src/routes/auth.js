const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middleware/auth');

// Seed demo users
const usersDB = [
  {
    id: 'usr-001',
    username: 'ndrf_admin',
    passwordHash: bcrypt.hashSync('ndrf2026', 8),
    name: 'Inspector R. S. Negi (NDRF 15th Bn)',
    role: 'SUPER_ADMIN',
    district: 'Uttarkashi'
  },
  {
    id: 'usr-002',
    username: 'sdma_officer',
    passwordHash: bcrypt.hashSync('sdma2026', 8),
    name: 'District Disaster Management Officer',
    role: 'DISTRICT_ADMIN',
    district: 'Uttarkashi'
  },
  {
    id: 'usr-003',
    username: 'citizen_guest',
    passwordHash: bcrypt.hashSync('citizen2026', 8),
    name: 'Resident Citizen',
    role: 'CITIZEN',
    district: 'Uttarkashi'
  }
];

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = usersDB.find(u => u.username === username);
  
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name, district: user.district },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      district: user.district
    }
  });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.json({ user: { id: 'usr-guest', name: 'Duty Officer NDRF', role: 'DISTRICT_ADMIN', district: 'Uttarkashi' } });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
