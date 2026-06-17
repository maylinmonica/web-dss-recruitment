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

// ==========================================
// 1. JALUR AKSES PELAMAR (APPLICANT)
// ==========================================

// Mengirimkan formulir aplikasi baru beserta berkas CV & Transkrip
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

// Mengambil data aplikasi milik pelamar yang sedang login
router.get('/me', verifyToken, authorizeRoles('Applicant'), getMyApplication);

// Mengajukan permohonan perubahan jadwal interview
router.put('/reschedule-request', verifyToken, authorizeRoles('Applicant'), requestReschedule);


// ==========================================
// 2. JALUR AKSES PANEL MANAGEMENT (TA & HR)
// ==========================================

// HR Manager: Mengambil hasil komputasi matriks peringkat TOPSIS
router.get('/ranking', verifyToken, authorizeRoles('HR Manager', 'Talent Acquisition'), getPerankingan);

// HR Manager: Memberikan keputusan final jadwal wawancara
router.put('/decision/:id', verifyToken, authorizeRoles('HR Manager'), setInterviewDecision);

// Talent Acquisition & HR: Melihat semua daftar pelamar masuk
router.get('/', verifyToken, authorizeRoles('Talent Acquisition', 'HR Manager'), getAllApplicants);

// Talent Acquisition: Menginput penilaian skor rubrik kualitatif dokumen
router.put('/verify/:id', verifyToken, authorizeRoles('Talent Acquisition'), verifyApplicantScores);

// Talent Acquisition & HR: Melihat detail profil satu pelamar berdasarkan ID
router.get('/:id', verifyToken, authorizeRoles('Talent Acquisition', 'HR Manager'), getApplicantById); 

module.exports = router;