const express = require('express');
const router = express.Router();
const { getCriteria, updateCriteria } = require('../controllers/criteriaController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, authorizeRoles('HR Manager'), getCriteria);
router.put('/update', verifyToken, authorizeRoles('HR Manager'), updateCriteria);

module.exports = router;