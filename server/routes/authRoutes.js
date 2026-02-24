const express = require('express');
const router = express.Router();
const { googleLogin, registerUser, authUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);

module.exports = router;
