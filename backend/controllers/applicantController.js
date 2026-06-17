const { pool } = require('../db');
const { readCriteria } = require('../dataStore'); // Kriteria bobot tetap aman di json

// HELPER MAPPER: Mengubah baris snake_case PostgreSQL menjadi camelCase standarisasi Frontend & TOPSIS
const mapRowToApplicant = (row) => {
    if (!row) return null;
    return {
        id: row.id.toString(),
        email: row.email,
        name: row.name,
        category: row.category,
        c1_gpa: parseFloat(row.c1_gpa),
        c2_portfolio: row.c2_portfolio,
        c3_experience: row.c3_experience,
        c4_merits: row.c4_merits,
        c5_skills: row.c5_skills,
        c6_salary: row.c6_salary,
        portfolioUrl: row.portfolio_url || '',
        cvName: row.cv_name,
        transcriptName: row.transcript_name,
        certs: typeof row.certs === 'string' ? JSON.parse(row.certs) : row.certs || [],
        awards: typeof row.awards === 'string' ? JSON.parse(row.awards) : row.awards || [],
        skillsList: typeof row.skills_list === 'string' ? JSON.parse(row.skills_list) : row.skills_list || [],
        status: row.status,
        interviewDetails: typeof row.interview_details === 'string' ? JSON.parse(row.interview_details) : row.interview_details
    };
};

// 1. ENDPOINT: Mengirimkan Formulir Lamaran Baru (Pelamar)
exports.submitApplication = async (req, res) => {
    try {
        const { name, category, c1_gpa, c6_salary, portfolioUrl } = req.body;
        const emailPelamar = req.user?.email || ""; 

        if (!emailPelamar) {
            return res.status(401).json({
                status: "Fail",
                ui_notice: { title: "Sesi Berakhir", description: "Otorisasi akun Anda tidak aktif. Silakan masuk kembali.", type: "error" }
            });
        }

        if (!name || !category || c1_gpa === undefined || c6_salary === undefined) {
            return res.status(400).json({
                status: "Fail",
                ui_notice: { title: "Formulir Belum Lengkap", description: "Semua data profil utama dan kualifikasi pendaftaran wajib dilengkapi.", type: "warning" }
            });
        }

        const parsedGpa = parseFloat(c1_gpa);
        const cleanSalary = c6_salary.toString().replace(/[^0-9]/g, '');
        const parsedSalary = parseInt(cleanSalary, 10);

        if (isNaN(parsedGpa) || parsedGpa < 0 || parsedGpa > 4) {
            return res.status(400).json({
                status: "Fail",
                ui_notice: { title: "Nilai IPK Tidak Valid", description: "IPK harus berupa angka desimal antara rentang 0.00 hingga 4.00.", type: "warning" }
            });
        }

        if (isNaN(parsedSalary) || parsedSalary <= 0 || parsedSalary > 99999999) {
            return res.status(400).json({
                status: "Fail",
                ui_notice: { title: "Nominal Kompensasi Tidak Valid", description: "Batas pengisian ekspektasi kompensasi bulanan maksimal adalah Rp 99.999.999.", type: "warning" }
            });
        }

        // SQL: Cek data pendaftaran duplikat
        const checkResult = await pool.query('SELECT * FROM applicants WHERE LOWER(email) = LOWER($1)', [emailPelamar]);
        if (checkResult.rows.length > 0) {
            return res.status(400).json({
                status: "Fail",
                ui_notice: { title: "Pendaftaran Ditolak", description: "Email Anda sudah tercatat mengirimkan berkas lamaran sebelumnya.", type: "error" }
            });
        }

        let cvName = 'Curriculum_Vitae.pdf';
        let transcriptName = 'Transkrip_Nilai_Terakhir.pdf';

        if (req.files) {
            if (req.files['cv'] && req.files['cv'].length > 0) cvName = req.files['cv'][0].originalname;
            if (req.files['transcript'] && req.files['transcript'].length > 0) transcriptName = req.files['transcript'][0].originalname;
        }

        let parsedCerts = [];
        let parsedAwards = [];
        let parsedSkillsList = []; 
        
        if (req.body.certs) { try { parsedCerts = JSON.parse(req.body.certs); } catch (e) { parsedCerts = []; } }
        if (req.body.awards) { try { parsedAwards = JSON.parse(req.body.awards); } catch (e) { parsedAwards = []; } }
        if (req.body.skillsList) { try { parsedSkillsList = JSON.parse(req.body.skillsList); } catch (e) { parsedSkillsList = []; } }

        const defaultInterview = {
            isPassed: false,        
            status: "Locked",       
            date: "",               
            time: "",              
            link: "",
            rescheduleRequest: null
        };

        // SQL: Simpan formulir baru ke database PostgreSQL
        const insertQuery = `
            INSERT INTO applicants (
                email, name, category, c1_gpa, c2_portfolio, c3_experience, c4_merits, c5_skills, c6_salary,
                portfolio_url, cv_name, transcript_name, certs, awards, skills_list, status, interview_details
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `;

        const values = [
            emailPelamar.toLowerCase(), name, category, parsedGpa,
            portfolioUrl ? 4 : 1, 1, 
            parsedAwards.length > 0 ? Math.min(parsedAwards.length + 1, 5) : 1,
            parsedCerts.length > 0 ? Math.min(parsedCerts.length + 1, 5) : 1, 
            parsedSalary, portfolioUrl || '', cvName, transcriptName,
            JSON.stringify(parsedCerts), JSON.stringify(parsedAwards), JSON.stringify(parsedSkillsList),
            "Unverified", JSON.stringify(defaultInterview)
        ];

        const result = await pool.query(insertQuery, values);
        const newApplicant = mapRowToApplicant(result.rows[0]);

        return res.status(201).json({
            status: "Success",
            ui_notice: { title: "Pendaftaran Berhasil", description: "Seluruh data kualifikasi dan berkas administrasi Anda telah berhasil disimpan.", type: "success" },
            data: newApplicant
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", ui_notice: { title: "Hambatan Penyimpanan", description: error.message, type: "error" } });
    }
};

// 2. ENDPOINT: Input Skor Rubrik Kualitatif 1-5 (Talent Acquisition)
exports.verifyApplicantScores = async (req, res) => {
    const { id } = req.params;
    const { c2_portfolio, c3_experience, c4_merits } = req.body;

    try {
        const result = await pool.query(
            `UPDATE applicants SET c2_portfolio = $1, c3_experience = $2, c4_merits = $3, status = 'Verified' WHERE id = $4 RETURNING *`,
            [parseInt(c2_portfolio, 10), parseInt(c3_experience, 10), parseInt(c4_merits, 10), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: "Fail", ui_notice: { title: "Tidak Ditemukan", description: "Profil kandidat pelamar tidak valid.", type: "error" } });
        }

        const updated = mapRowToApplicant(result.rows[0]);
        return res.status(200).json({
            status: "Success",
            ui_notice: { title: "Verifikasi Berhasil", description: `Evaluasi dokumen berkas ${updated.name} telah disimpan untuk perangkingan.`, type: "success" }
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

// 3. ENDPOINT: Keputusan Penjadwalan Wawancara Final (HR Manager)
exports.setInterviewDecision = async (req, res) => {
    const { id } = req.params;
    const { decision, date, time, link } = req.body; 

    try {
        const updatedDetails = {
            isPassed: decision === 'Approved',
            status: decision === 'Approved' ? "Scheduled" : "Rejected",
            date: date || "",
            time: time || "",
            link: link || "",
            rescheduleRequest: null 
        };

        const result = await pool.query(
            `UPDATE applicants SET interview_details = $1 WHERE id = $2 RETURNING *`,
            [JSON.stringify(updatedDetails), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ status: "Fail", ui_notice: { title: "Tidak Ditemukan", description: "Profil kandidat pelamar tidak valid.", type: "error" } });
        }

        const updated = mapRowToApplicant(result.rows[0]);
        return res.status(200).json({
            status: "Success",
            ui_notice: {
                title: decision === 'Approved' ? "Kandidat Disetujui" : "Kandidat Ditandai Tidak Lolos",
                description: decision === 'Approved' ? `Jadwal wawancara resmi untuk ${updated.name} berhasil diterbitkan.` : `Profil ${updated.name} ditandai tidak dilanjutkan ke tahap wawancara.`,
                type: decision === 'Approved' ? "success" : "warning"
            },
            data: updated
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

// 4. ENDPOINT: Pengajuan Perubahan Jadwal Wawancara (Pelamar)
exports.requestReschedule = async (req, res) => {
    const emailPelamar = req.user?.email || "";
    const { reason } = req.body;

    try {
        const checkResult = await pool.query('SELECT * FROM applicants WHERE LOWER(email) = LOWER($1)', [emailPelamar]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ status: "Fail", ui_notice: { title: "Data Tidak Ditemukan", description: "Profil pendaftaran lamaran Anda tidak ditemukan.", type: "error" } });
        }

        const applicant = mapRowToApplicant(checkResult.rows[0]);
        const currentDetails = applicant.interviewDetails || {};
        currentDetails.rescheduleRequest = {
            requested: true,
            reason: reason.trim(),
            status: "Pending"
        };

        await pool.query('UPDATE applicants SET interview_details = $1 WHERE LOWER(email) = LOWER($2)', [JSON.stringify(currentDetails), emailPelamar.toLowerCase()]);

        return res.status(200).json({
            status: "Success",
            ui_notice: { title: "Permohonan Terkirim", description: "Permintaan perubahan jadwal wawancara Anda berhasil diteruskan kepada HR Manager.", type: "success" }
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

// 5. ENGINE KOMPUTASI MATRIKS TOPSIS
exports.getPerankingan = async (req, res) => {
    const { category } = req.query;

    try {
        const dbResult = await pool.query('SELECT * FROM applicants');
        const allApplicants = dbResult.rows.map(mapRowToApplicant);
        
        const candidates = allApplicants
            .filter(app => app.status === "Verified" && (category === 'All' || app.category === category))
            .map(app => ({
                ...app,
                c1_gpa:       parseFloat(app.c1_gpa)       || 0,
                c2_portfolio:  parseFloat(app.c2_portfolio)  || 0,
                c3_experience: parseFloat(app.c3_experience) || 0,
                c4_merits:     parseFloat(app.c4_merits)     || 0,
                c5_skills:     parseFloat(app.c5_skills)     || 0,
                c6_salary:     parseFloat(app.c6_salary)     || 0,
            }));

        if (candidates.length === 0) {
            return res.status(200).json({ status: "Success", category, ranking: [] });
        }

        if (candidates.length === 1) {
            const single = candidates[0];
            return res.status(200).json({
                status: "Success",
                category,
                ranking: [{ id: single.id, name: single.name, d_plus: "0.0000", d_minus: "0.0000", preference: "1.0000", interviewDetails: single.interviewDetails || { status: "Locked" } }]
            });
        }

        const criteriaConfig = readCriteria();
        const W   = criteriaConfig.weights;
        const attr = criteriaConfig.attributes;

        const fields = ['c1_gpa', 'c2_portfolio', 'c3_experience', 'c4_merits', 'c5_skills', 'c6_salary'];
        const keys   = ['c1',     'c2',            'c3',            'c4',        'c5',        'c6'];

        const divisor = {};
        keys.forEach((k, i) => {
            const sumSq = candidates.reduce((sum, c) => sum + Math.pow(c[fields[i]], 2), 0);
            divisor[k] = Math.sqrt(sumSq) || 1;
        });

        const matrixY = candidates.map(c => ({
            id:   c.id,
            name: c.name,
            y1: (c.c1_gpa       / divisor.c1) * parseFloat(W.c1),
            y2: (c.c2_portfolio  / divisor.c2) * parseFloat(W.c2),
            y3: (c.c3_experience / divisor.c3) * parseFloat(W.c3),
            y4: (c.c4_merits     / divisor.c4) * parseFloat(W.c4),
            y5: (c.c5_skills     / divisor.c5) * parseFloat(W.c5),
            y6: (c.c6_salary     / divisor.c6) * parseFloat(W.c6),
        }));

        const getIdealPair = (colVals, attribute) => {
            const maxVal = Math.max(...colVals);
            const minVal = Math.min(...colVals);
            if (attribute === 'benefit') return { pos: maxVal, neg: minVal };
            return { pos: minVal, neg: maxVal };
        };

        const colMap = [
            { col: 'y1', attr: attr.c1 }, { col: 'y2', attr: attr.c2 }, { col: 'y3', attr: attr.c3 },
            { col: 'y4', attr: attr.c4 }, { col: 'y5', attr: attr.c5 }, { col: 'y6', attr: attr.c6 },
        ];

        const ideals = colMap.map(({ col, attr: a }) => {
            const vals = matrixY.map(r => r[col]);
            return getIdealPair(vals, a);
        });

        const withDistance = matrixY.map(row => {
            const cols = ['y1', 'y2', 'y3', 'y4', 'y5', 'y6'];
            const d_plus = Math.sqrt(cols.reduce((sum, col, i) => sum + Math.pow(row[col] - ideals[i].pos, 2), 0));
            const d_minus = Math.sqrt(cols.reduce((sum, col, i) => sum + Math.pow(row[col] - ideals[i].neg, 2), 0));
            const preference_num = (d_plus + d_minus) === 0 ? 0 : d_minus / (d_plus + d_minus);

            return { id: row.id, name: row.name, d_plus_num: d_plus, d_minus_num: d_minus, preference_num };
        });

        withDistance.sort((a, b) => b.preference_num - a.preference_num);

        const rankingResults = withDistance.map(row => {
            const original = candidates.find(c => c.id === row.id);
            return {
                id:         row.id,
                name:       row.name,
                d_plus:     row.d_plus_num.toFixed(4),
                d_minus:    row.d_minus_num.toFixed(4),
                preference: row.preference_num.toFixed(4),
                interviewDetails: original?.interviewDetails || { status: "Locked" }
            };
        });
        
        const criteriaUsed = keys.map((k) => ({ key: k, weight: parseFloat(W[k]), attribute: attr[k] }));
        const decisionMatrix = candidates.map(c => ({
            name: c.name,
            values: { c1: c.c1_gpa, c2: c.c2_portfolio, c3: c.c3_experience, c4: c.c4_merits, c5: c.c5_skills, c6: c.c6_salary }
        }));

        const labelKategori = category === 'All' ? 'Semua Kategori' : category;

        return res.status(200).json({
            status: "Success",
            ui_notice: { title: "Analisis Berhasil", description: `Peringkat rekomendasi kelompok ${labelKategori} sukses diperbarui.`, type: "success" },
            category, ideals, criteriaUsed, decisionMatrix, ranking: rankingResults
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", ui_notice: { title: "Error Komputasi", description: error.message, type: "error" } });
    }
};

// 6. ENDPOINT: List Semua Pelamar
exports.getAllApplicants = async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM applicants';
        let params = [];
        
        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }
        
        const dbResult = await pool.query(query, params);
        const data = dbResult.rows.map(mapRowToApplicant);
        return res.status(200).json({ status: "Success", count: data.length, data: data });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

// 7. ENDPOINT: Detail Satu Pelamar Berdasarkan ID
exports.getApplicantById = async (req, res) => {
    const { id } = req.params;
    try {
        const dbResult = await pool.query('SELECT * FROM applicants WHERE id = $1', [id]);
        const applicant = mapRowToApplicant(dbResult.rows[0]);
        
        if (!applicant) {
            return res.status(404).json({ status: "Fail", ui_notice: { title: "Tidak Ditemukan", description: "Profil pelamar tidak ditemukan.", type: "error" } });
        }
        return res.status(200).json({ status: "Success", data: applicant });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

// 8. ENDPOINT: Ambil Data Pribadi Berdasarkan Token Login Pelamar
exports.getMyApplication = async (req, res) => {
    const emailPelamar = req.user?.email || "";
    try {
        const dbResult = await pool.query('SELECT * FROM applicants WHERE LOWER(email) = LOWER($1)', [emailPelamar]);
        const myApplication = mapRowToApplicant(dbResult.rows[0]);

        if (!myApplication) {
            return res.status(404).json({ status: "Fail", ui_notice: { title: "Belum Ada Lamaran", description: "Anda belum mengisi formulir pendaftaran.", type: "warning" } });
        }
        return res.status(200).json({ status: "Success", data: myApplication });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};