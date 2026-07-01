const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); 

dotenv.config();

const { initDatabase } = require('./db'); 

const app = express();

initDatabase();

/**
 * Global Middleware Configurations:
 * Enables Cross-Origin Resource Sharing (CORS) and registers JSON payload parsers.
 */
app.use(cors());
app.use(express.json());

/**
 * API Modular Routes Registration Framework
 */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/applicants', require('./routes/applicantRoutes')); 
app.use('/api/criteria', require('./routes/criteriaRoutes'));

/**
 * File Retrieval Subsystem: 
 * Scans multi-layered filesystem structural paths to resolve static file requests dynamically.
 */
app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    
    // Matrix of potential localized storage paths across diverse deployment and environment layers
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

    // Exception Routine: Triggered when file assets are unresolved across all directory layers
    console.error(`❌ Radar Gagal: File ${filename} tidak ditemukan di lokasi server manapun.`);
    return res.status(404).send(`Cannot GET /uploads/${filename}`);
});

/**
 * Baseline Route: Primary connection state validation endpoint.
 */
app.get('/', (req, res) => {
    res.json({ 
        status: "Success",
        message: "Server Active. Welcome to the Recruitment Decision Support System API." 
    });
});

/**
 * Execution Listener: Initializes server socket binding on designated port coordinates.
 */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`STATUS: Server internal aktif dan siap menerima request.`);
    console.log(`PORT AKTIF: ${PORT}`);
    console.log('===================================================');
});