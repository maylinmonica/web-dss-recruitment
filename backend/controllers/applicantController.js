const { readApplicants, saveApplicants, readCriteria } = require('../dataStore');

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

    const allApplicants = readApplicants() || [];
        const hasApplied = allApplicants.find(app => app.email && app.email.toLowerCase() === emailPelamar.toLowerCase());

        if (hasApplied) {
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

        const newApplicant = {
            id: (allApplicants.length + 1).toString(),
            email: emailPelamar.toLowerCase(),
            name,
            category,
            c1_gpa: parsedGpa,
            c2_portfolio: portfolioUrl ? 4 : 1, 
            c3_experience: 1, 
            c4_merits: parsedAwards.length > 0 ? Math.min(parsedAwards.length + 1, 5) : 1, 
            c5_skills: parsedCerts.length > 0 ? Math.min(parsedCerts.length + 1, 5) : 1, 
            c6_salary: parsedSalary,
            portfolioUrl: portfolioUrl || '',
            cvName: cvName,
            transcriptName: transcriptName,
            certs: parsedCerts,
            awards: parsedAwards,
            skillsList: parsedSkillsList, 
            status: "Unverified",
            interviewDetails: {
                isPassed: false,        
                status: "Locked",       
                date: "",               
                time: "",              
                link: "",
                rescheduleRequest: null
            }
        };

        allApplicants.push(newApplicant);
        saveApplicants(allApplicants);

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
    const { c2_portfolio, c3_experience, c4_merits, c5_skills } = req.body;

    const scores = { c2_portfolio, c3_experience, c4_merits, c5_skills };
    for (const [key, value] of Object.entries(scores)) {
        if (value === undefined) {
            return res.status(400).json({
                status: "Fail",
                ui_notice: { title: "Formulir Nilai Tidak Lengkap", description: "Seluruh kriteria penilaian kualitatif wajib ditentukan.", type: "warning" }
            });
        }
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 5) {
            return res.status(400).json({
                status: "Fail",
                ui_notice: { title: "Skor Di Luar Batas", description: `Nilai kriteria ${key} harus berada pada rentang skala bulat 1 sampai 5.`, type: "warning" }
            });
        }
    }

    try {
        let allApplicants = readApplicants();
        const idx = allApplicants.findIndex(app => app.id === id);

        if (idx === -1) {
            return res.status(404).json({ status: "Fail", ui_notice: { title: "Tidak Ditemukan", description: "Profil kandidat pelamar tidak valid.", type: "error" } });
        }

        allApplicants[idx].c2_portfolio = parseInt(c2_portfolio, 10);
        allApplicants[idx].c3_experience = parseInt(c3_experience, 10);
        allApplicants[idx].c4_merits = parseInt(c4_merits, 10);
        allApplicants[idx].status = "Verified";

        saveApplicants(allApplicants);
        return res.status(200).json({
            status: "Success",
            ui_notice: { title: "Verifikasi Berhasil", description: `Evaluasi dokumen berkas ${allApplicants[idx].name} telah disimpan untuk perangkingan.`, type: "success" }
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

// 3. ENDPOINT: Keputusan Penjadwalan Wawancara Final (HR Manager)
exports.setInterviewDecision = async (req, res) => {
    const { id } = req.params;
    const { decision, date, time, link } = req.body; 

    if (!decision || !['Approved', 'Rejected'].includes(decision)) {
        return res.status(400).json({
            status: "Fail",
            ui_notice: { title: "Keputusan Tidak Valid", description: "Status keputusan akhir harus berupa Approved atau Rejected.", type: "warning" }
        });
    }

    if (decision === 'Approved' && (!date || !time)) {
        return res.status(400).json({
            status: "Fail",
            ui_notice: { title: "Jadwal Belum Lengkap", description: "Tanggal dan waktu interview wajib ditentukan untuk kandidat yang disetujui.", type: "warning" }
        });
    }

    try {
        let allApplicants = readApplicants();
        const idx = allApplicants.findIndex(app => app.id === id);

        if (idx === -1) {
            return res.status(404).json({ status: "Fail", ui_notice: { title: "Tidak Ditemukan", description: "Profil kandidat pelamar tidak valid.", type: "error" } });
        }

        allApplicants[idx].interviewDetails = {
            isPassed: decision === 'Approved',
            status: decision === 'Approved' ? "Scheduled" : "Rejected",
            date: date || "",
            time: time || "",
            link: link || "",
            rescheduleRequest: null 
        };

        saveApplicants(allApplicants);

        return res.status(200).json({
            status: "Success",
            ui_notice: {
                title: decision === 'Approved' ? "Kandidat Disetujui" : "Kandidat Ditandai Tidak Lolos",
                description: decision === 'Approved' ? `Jadwal wawancara resmi untuk ${allApplicants[idx].name} berhasil diterbitkan.` : `Profil ${allApplicants[idx].name} ditandai tidak dilanjutkan ke tahap wawancara.`,
                type: decision === 'Approved' ? "success" : "warning"
            },
            data: allApplicants[idx]
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

// 4. ENDPOINT: Pengajuan Perubahan Jadwal Wawancara (Pelamar)
exports.requestReschedule = async (req, res) => {
    const emailPelamar = req.user?.email || "";
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
        return res.status(400).json({
            status: "Fail",
            ui_notice: { title: "Alasan Kosong", description: "Alasan pengajuan perubahan jadwal wawancara wajib diisi.", type: "warning" }
        });
    }

    try {
        let allApplicants = readApplicants();
        const idx = allApplicants.findIndex(app => app.email && app.email.toLowerCase() === emailPelamar.toLowerCase());

        if (idx === -1) {
            return res.status(404).json({ 
                status: "Fail", 
                ui_notice: { title: "Data Tidak Ditemukan", description: "Profil pendaftaran lamaran Anda tidak ditemukan.", type: "error" } 
            });
        }

        if (!allApplicants[idx].interviewDetails) {
            allApplicants[idx].interviewDetails = { isPassed: false, status: "Locked", date: "", time: "", link: "" };
        }

        allApplicants[idx].interviewDetails.rescheduleRequest = {
            requested: true,
            reason: reason.trim(),
            status: "Pending"
        };

        saveApplicants(allApplicants);

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

    if (!category) {
        return res.status(400).json({
            status: "Fail",
            ui_notice: { title: "Kategori Kosong", description: "Parameter kategori lowongan dibutuhkan.", type: "warning" }
        });
    }

    const allApplicants = readApplicants();
    const candidates = allApplicants
        .filter(app => app.category === category && app.status === "Verified")
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

    try {
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
        
        return res.status(200).json({
            status: "Success",
            ui_notice: { title: "Analisis Berhasil", description: `Peringkat rekomendasi kelompok ${category} sukses diperbarui.`, type: "success" },
            category,
            ranking: rankingResults
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", ui_notice: { title: "Error Komputasi", description: error.message, type: "error" } });
    }
};// 5. ENGINE KOMPUTASI MATRIKS TOPSIS — PEMBARUAN DATA AUDIT TRANSPARANSI

// 5. ENGINE KOMPUTASI MATRIKS TOPSIS — GABUNGAN & AUDIT TRANSPARANSI RUMUS
exports.getPerankingan = async (req, res) => {
    const { category } = req.query;

    if (!category) {
        return res.status(400).json({
            status: "Fail",
            ui_notice: { title: "Kategori Kosong", description: "Parameter kategori lowongan dibutuhkan.", type: "warning" }
        });
    }

    const allApplicants = readApplicants();
    
    // PERBAIKAN 1: Mendukung peringkat gabungan jika parameter bernilai 'All'
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

    try {
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
        
        // PERBAIKAN 2: Rekonstruksi data kriteria pendukung untuk portal audit transparansi rumus
        const criteriaUsed = keys.map((k) => ({
            key: k,
            weight: parseFloat(W[k]),
            attribute: attr[k]
        }));

        const decisionMatrix = candidates.map(c => ({
            name: c.name,
            values: {
                c1: c.c1_gpa,
                c2: c.c2_portfolio,
                c3: c.c3_experience,
                c4: c.c4_merits,
                c5: c.c5_skills,
                c6: c.c6_salary,
            }
        }));

        const labelKategori = category === 'All' ? 'Semua Kategori' : category;

        return res.status(200).json({
            status: "Success",
            ui_notice: { 
                title: "Analisis Berhasil", 
                description: `Peringkat rekomendasi kelompok ${labelKategori} sukses diperbarui.`, 
                type: "success" 
            },
            category,
            ideals,            // Dikirimkan ke front-end
            criteriaUsed,      // Dikirimkan ke front-end
            decisionMatrix,    // Dikirimkan ke front-end
            ranking: rankingResults
        });
    } catch (error) {
        return res.status(500).json({ status: "Error", ui_notice: { title: "Error Komputasi", description: error.message, type: "error" } });
    }
};

// 6. ENDPOINT: List Semua Pelamar
exports.getAllApplicants = async (req, res) => {
    try {
        const { status } = req.query;
        let allApplicants = readApplicants();
        if (status) allApplicants = allApplicants.filter(app => app.status === status);
        return res.status(200).json({ status: "Success", count: allApplicants.length, data: allApplicants });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};

// 7. ENDPOINT: Detail Satu Pelamar Berdasarkan ID
exports.getApplicantById = async (req, res) => {
    const { id } = req.params;
    try {
        const allApplicants = readApplicants();
        const applicant = allApplicants.find(app => app.id === id);
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
        const allApplicants = readApplicants();
        const myApplication = allApplicants.find(app => app.email && app.email.toLowerCase() === emailPelamar.toLowerCase());

        if (!myApplication) {
            return res.status(404).json({ status: "Fail", ui_notice: { title: "Belum Ada Lamaran", description: "Anda belum mengisi formulir pendaftaran.", type: "warning" } });
        }
        return res.status(200).json({ status: "Success", data: myApplication });
    } catch (error) {
        return res.status(500).json({ status: "Error", message: error.message });
    }
};