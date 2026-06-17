const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const { readUsers, saveUsers } = require('../dataStore');

// 1. ENDPOINT: Registrasi Akun Pelamar
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

    // PERBAIKAN: Validasi panjang kata sandi minimal 8 karakter di sisi server
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
        const users = readUsers();
        const userExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (userExists) {
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

        const newApplicant = { 
            email: email.toLowerCase(), 
            password: hashedPassword, 
            role: "Applicant" 
        };
        
        users.push(newApplicant);
        saveUsers(users);

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

// 2. ENDPOINT: Login Komparasi Hash Password & Produksi Token JWT
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = readUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

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