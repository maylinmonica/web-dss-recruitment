const express = require('express');
const router = express.Router();
const {
    getPerankingan,
    submitApplication,
    verifyApplicantScores,
    getAllApplicants,
    getApplicantById,
    getMyApplication,
    setInterviewDecision,
    requestReschedule
} = require('../controllers/applicantController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// 1. Jalur Pelamar
router.post(
    '/apply', 
    verifyToken, 
    authorizeRoles('Applicant'), 
    upload.fields([
        { name: 'cv', maxCount: 1 },
        { name: 'transcript', maxCount: 1 }
    ]), 
    submitApplication
);

router.put(
    '/decision/:id', 
    verifyToken, 
    authorizeRoles('HR Manager'), 
    setInterviewDecision
);

// [Daftarkan rutenya tepat di bawah rute /me pelamar]
router.post('/apply', verifyToken, authorizeRoles('Applicant'), upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'transcript', maxCount: 1 }]), submitApplication);
router.get('/me', verifyToken, authorizeRoles('Applicant'), getMyApplication);

// RUTE BARU: Menampung kiriman data alasan perubahan jadwal dari akun pelamar
router.put('/reschedule-request', verifyToken, authorizeRoles('Applicant'), requestReschedule);

router.get('/me', verifyToken, authorizeRoles('Applicant'), getMyApplication);

router.get('/ranking', verifyToken, authorizeRoles('HR Manager', 'Talent Acquisition'), getPerankingan);

// 3. Jalur Panel TA
router.get('/', verifyToken, authorizeRoles('Talent Acquisition', 'HR Manager'), getAllApplicants);
router.put('/verify/:id', verifyToken, authorizeRoles('Talent Acquisition'), verifyApplicantScores);
router.get('/:id', verifyToken, authorizeRoles('Talent Acquisition', 'HR Manager'), getApplicantById); 



module.exports = router;