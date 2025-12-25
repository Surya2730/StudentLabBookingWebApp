const express = require('express');
const router = express.Router();
const { googleLogin, devLogin } = require('../controllers/authController');

router.post('/google', googleLogin);
router.post('/dev-login', devLogin);

module.exports = router;
