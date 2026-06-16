const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file disk
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/')); // Disimpan ke backend/uploads
    },
    filename: function (req, file, cb) {
        // Mengunci nama file agar tetap asli sesuai yang diunggah pelamar
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
module.exports = upload;