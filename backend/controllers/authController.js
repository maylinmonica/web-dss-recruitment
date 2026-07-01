const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const { pool } = require('../db'); // Relational database pooling system connector initialization

/**
 * Request Handler: Processes new applicant account registration.
 * Validates credentials schema boundary rules and persists salted password configurations.
 */
exports.registerApplicant = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: "Fail",
            ui_notice: {
                title: "Data Belum Lengkap",
                description: "Alamat email dan kata sandi wajib diisi untuk membuat akun baru.",
                type: "warning"
            }
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            status: "Fail",
            ui_notice: {
                title: "Kata Sandi Terlalu Pendek",
                description: "Kata sandi wajib memiliki minimal 8 karakter.",
                type: "warning"
            }
        });
    }

    try {
        // Integrity Validation: Verify uniqueness constraints to prevent duplicate database record creation
        const userCheck = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);

        if (userCheck.rows.length > 0) {
            return res.status(400).json({
                status: "Fail",
                ui_notice: {
                    title: "Email Sudah Terdaftar",
                    description: "Alamat email ini telah digunakan. Silakan gunakan email lain.",
                    type: "error"
                }
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Persistence Routine: Insert verified payload data parameters into the users schema
        await pool.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
            [email.toLowerCase(), hashedPassword, "Applicant"]
        );

        return res.status(201).json({
            status: "Success",
            ui_notice: {
                title: "Pendaftaran Akun Sukses",
                description: "Akun Anda berhasil diaktifkan! Silakan melakukan Log In pada halaman utama.",
                type: "success"
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: "Error",
            ui_notice: { title: "Gangguan Server", description: error.message, type: "error" }
        });
    }
};

/**
 * Request Handler: Authenticates existing system profiles.
 * Verifies cryptographic password validation matching and provisions JWT session assets.
 */
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Query Execution: Query account registration entities matching current email token
        const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ 
                status: "Fail",
                ui_notice: { 
                    title: "Email Tidak Terdaftar", 
                    description: "Alamat email ini belum terdaftar di pangkalan data kami. Silakan registrasi terlebih dahulu.", 
                    type: "warning" 
                }
            });
        }

        let isMatch = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            if (password === user.password) isMatch = true;
        }

        if (!isMatch) {
            return res.status(401).json({ 
                status: "Fail",
                ui_notice: { 
                    title: "Kata Sandi Salah", 
                    description: "Kombinasi kata sandi yang Anda masukkan tidak cocok. Silakan coba kembali.", 
                    type: "error" 
                }
            });
        }

        const token = jwt.sign({ email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        return res.status(200).json({
            status: "Success",
            ui_notice: { title: "Akses Diberikan", description: `Selamat datang kembali, pendaftaran Anda aktif!`, type: "success" },
            token,
            user: { email: user.email, role: user.role }
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};