const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const { 
  login, 
  me, 
  changePassword, 
  registerAdmin 
} = require('../controllers/auth.controller');

router.post('/register-admin', registerAdmin);

router.post('/login', login);

router.get('/me', auth, me);

router.patch('/change-password', auth, changePassword);

module.exports = router;