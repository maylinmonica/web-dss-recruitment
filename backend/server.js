const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // Tambahan modul untuk melacak file fisik

dotenv.config();

const { initDatabase } = require('./db'); 

const app = express();

initDatabase();

// Konfigurasi Middleware Global
app.use(cors());
app.use(express.json());

// Registrasi Jalur Endpoint API Modular
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applicants', require('./routes/applicantRoutes')); 
app.use('/api/criteria', require('./routes/criteriaRoutes'));

// 🛠️ PERBAIKAN: Memastikan folder 'uploads' selalu dibuat paksa agar server tidak kebingungan
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Sistem: Folder uploads otomatis dibuat di lokasi -> ${uploadDir}`);
}

// Mengekspos folder uploads agar bisa diunduh oleh Manager/TA
app.use('/uploads', express.static(uploadDir));

// 🚨 RADAR DETEKTIF: Jalur khusus untuk ngintip isi folder uploads di Railway
app.get('/api/debug-folder', (req, res) => {
    try {
        const files = fs.readdirSync(uploadDir);
        res.json({
            status: "Success",
            lokasi_folder_asli_di_railway: uploadDir,
            jumlah_file_yang_tersisa: files.length,
            daftar_nama_file: files
        });
    } catch (error) {
        res.status(500).json({ status: "Error", pesan: error.message });
    }
});

// Rute Dasar
app.get('/', (req, res) => {
    res.json({ 
        status: "Success",
        message: "Server Active. Welcome to the Recruitment Decision Support System API." 
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`STATUS: Server internal aktif dan siap menerima request.`);
    console.log(`PORT AKTIF: ${PORT}`);
    console.log('===================================================');
});