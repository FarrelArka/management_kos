const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const authenticate = require('../middleware/auth');

router.post('/register', auth.register); // body: name,email,password,phone,role(optional)
router.post('/login', auth.login);
router.post('/upgrade-owner', authenticate, auth.upgradeToOwner); // society -> owner

module.exports = router;
