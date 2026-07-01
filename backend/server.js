const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); 

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

app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    
    // Daftar semua kemungkinan lokasi folder uploads pembentuk monorepo di lokal maupun cloud
    const possiblePaths = [
        path.join(__dirname, 'uploads', filename),
        path.join(__dirname, 'Uploads', filename),
        path.join(__dirname, '..', 'uploads', filename),
        path.join(__dirname, '..', 'Uploads', filename),
        path.join(process.cwd(), 'uploads', filename),
        path.join(process.cwd(), 'Uploads', filename),
        path.join(process.cwd(), 'backend', 'uploads', filename),
        path.join(process.cwd(), 'backend', 'Uploads', filename),
        path.join(process.cwd(), 'backend', 'src', 'uploads', filename),
        path.join(__dirname, 'src', 'uploads', filename)
    ];

    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log(`🎯 Radar Berhasil! Berkas ditemukan dan dikirim dari: ${filePath}`);
            return res.sendFile(filePath);
        }
    }

    // Jika benar-benar tidak ditemukan di folder manapun setelah dipindai
    console.error(`❌ Radar Gagal: File ${filename} tidak ditemukan di lokasi server manapun.`);
    return res.status(404).send(`Cannot GET /uploads/${filename}`);
});

// Rute Dasar untuk Pengujian Konektivitas Utama
app.get('/', (req, res) => {
    res.json({ 
        status: "Success",
        message: "Server Active. Welcome to the Recruitment Decision Support System API." 
    });
});

// Konfigurasi Port Penting untuk Sinkronisasi Cloud & Lokal
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`STATUS: Server internal aktif dan siap menerima request.`);
    console.log(`PORT AKTIF: ${PORT}`);
    console.log('===================================================');
});