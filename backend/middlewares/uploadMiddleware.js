const multer = require('multer');
const path = require('path');

/**
 * Storage Engine Configuration: Defines disk storage subsystem behaviors
 * for processing incoming multipart form-data binary attachments.
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Directory Mapping Layer: Resolves target absolute local storage path for file ingestion
        cb(null, path.join(__dirname, '../uploads/')); 
    },
    filename: function (req, file, cb) {
        // Payload Identity Tracking: Retains original raw metadata filename parameters from the source file header
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
module.exports = upload;