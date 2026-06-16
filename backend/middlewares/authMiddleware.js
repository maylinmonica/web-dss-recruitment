const jwt = require('jsonwebtoken');

// Middleware untuk memvalidasi keberadaan dan keaslian token JWT
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Memeriksa apakah header Authorization dikirimkan
    if (!authHeader) {
        return res.status(403).json({
            status: "Fail",
            message: "Akses ditolak. Token autentikasi tidak ditemukan."
        });
    }

    // Mengambil token setelah kata 'Bearer '
    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Menyimpan data user hasil decode ke dalam request
        next();
    } catch (error) {
        return res.status(401).json({
            status: "Fail",
            message: "Token tidak valid atau telah kedaluwarsa."
        });
    }
};

// Middleware untuk melakukan pembatasan hak akses berdasarkan Peran (Role)
exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: "Fail",
                message: "Hak akses ditolak. Peran Anda tidak diizinkan mengakses halaman ini."
            });
        }
        next();
    }
};