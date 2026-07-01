const jwt = require('jsonwebtoken');

/**
 * Interceptor Middleware: Validates the presence and cryptographic signature 
 * of the JSON Web Token (JWT) supplied via request headers.
 */
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // Boundary Check: Ensure the Authorization header exists within the incoming request context
    if (!authHeader) {
        return res.status(403).json({
            status: "Fail",
            message: "Akses ditolak. Token autentikasi tidak ditemukan."
        });
    }

    // Token Extraction: Isolate the token literal string from the 'Bearer ' schema structure
    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // Context Assignment: Inject the verified decoded user payload into the request pipeline
        req.user = verified; 
        next();
    } catch (error) {
        return res.status(401).json({
            status: "Fail",
            message: "Token tidak valid atau telah kedaluwarsa."
        });
    }
};

/**
 * Guard Middleware: Enforces role-based access control (RBAC) across protected route fragments.
 * Evaluates contextual claims injected by the token verification layer.
 */
exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Authorization Matrix Evaluation: Map authenticated role state against acceptable boundaries
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: "Fail",
                message: "Hak akses ditolak. Peran Anda tidak diizinkan mengakses halaman ini."
            });
        }
        next();
    }
};