const express = require('express');
const router = express.Router();
const { loginUser, registerApplicant } = require('../controllers/authController');

router.post('/register', registerApplicant); 
router.post('/login', loginUser);

module.exports = router;