const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDatabase } = require('./db'); // Impor koneksi PostgreSQL

// Memuat variabel lingkungan dari file .env
dotenv.config();

const app = express();

// Jalankan pembuatan tabel otomatis saat server booting pertama kali
initDatabase();

// Konfigurasi Middleware Global
app.use(cors());
app.use(express.json());

// Registrasi Jalur Endpoint API Modular
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applicants', require('./routes/applicantRoutes')); 
app.use('/api/criteria', require('./routes/criteriaRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rute Dasar untuk Pengujian Konektivitas Utama
app.get('/', (req, res) => {
    res.json({ 
        status: "Success",
        message: "Server Active. Welcome to the Recruitment Decision Support System API." 
    });
});

// Konfigurasi Port Tunggal untuk Sinkronisasi Cloud & Lokal
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`STATUS: Server internal aktif dan siap menerima request.`);
    console.log(`PORT AKTIF: ${PORT}`);
    console.log('===================================================');
});