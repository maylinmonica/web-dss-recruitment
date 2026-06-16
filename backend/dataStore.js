const fs = require('fs');
const path = require('path');

// Menentukan jalur lokasi penyimpanan berkas JSON fisik
const applicantsFilePath = path.join(__dirname, 'applicants.json');
const criteriaFilePath = path.join(__dirname, 'criteria.json');
const usersFilePath = path.join(__dirname, 'users.json');

// 1. DATA SEEDING USER INTERNAL & AKUN PELAMAR SIMULASI [cite: 50]
const defaultUsers = [
    { email: 'ta@perusahaan.com', password: 'passwordTA2026', role: 'Talent Acquisition' },
    { email: 'manager@perusahaan.com', password: 'passwordManager2026', role: 'HR Manager' },
    { email: 'maylinthelaw@gmail.com', password: 'password123', role: 'Applicant' }
];

// 2. DATA SEEDING 8 PELAMAR TERSTANDARISASI 6 KRITERIA (C1 - C6) [cite: 4, 21, 22]
const defaultApplicants = [
    { id: "1", email: "maylinthelaw@gmail.com", name: "Maylin June", category: "Final Year", c1_gpa: 3.90, c2_portfolio: 5, c3_experience: 4, c4_merits: 5, c5_skills: 5, c6_salary: 3500000, status: "Verified" },
    { id: "2", email: "topan@gmail.com", name: "Topan Aditya", category: "Final Year", c1_gpa: 3.45, c2_portfolio: 4, c3_experience: 3, c4_merits: 2, c5_skills: 4, c6_salary: 4000000, status: "Verified" },
    { id: "3", email: "dini@gmail.com", name: "Dini Lestari", category: "Final Year", c1_gpa: 3.20, c2_portfolio: 3, c3_experience: 5, c4_merits: 4, c5_skills: 4, c6_salary: 3000000, status: "Verified" },
    { id: "4", email: "novi@gmail.com", name: "Novi Fatmawati", category: "Final Year", c1_gpa: 3.60, c2_portfolio: 2, c3_experience: 2, c4_merits: 1, c5_skills: 3, c6_salary: 4500000, status: "Verified" },
    { id: "5", email: "asep@gmail.com", name: "Asep Setiawan", category: "Fresh Graduate", c1_gpa: 3.75, c2_portfolio: 4, c3_experience: 4, c4_merits: 3, c5_skills: 4, c6_salary: 5000000, status: "Verified" },
    { id: "6", email: "made@gmail.com", name: "Made Sitorus", category: "Fresh Graduate", c1_gpa: 3.10, c2_portfolio: 5, c3_experience: 2, c4_merits: 5, c5_skills: 5, c6_salary: 4800000, status: "Verified" },
    { id: "7", email: "nyoman@gmail.com", name: "Nyoman Maruli", category: "Fresh Graduate", c1_gpa: 3.80, c2_portfolio: 3, c3_experience: 3, c4_merits: 2, c5_skills: 3, c6_salary: 5500000, status: "Verified" },
    { id: "8", email: "hendra@gmail.com", name: "Hendra Wijaya", category: "Fresh Graduate", c1_gpa: 3.40, c2_portfolio: 2, c3_experience: 5, c4_merits: 1, c5_skills: 4, c6_salary: 4200000, status: "Verified" }
];

// 3. DATA SEEDING UPDATE CONFIG BOBOT & ATRIBUT BARU (TOTAL PAS 1.0 / 100%) [cite: 18, 22]
const defaultCriteria = {
    weights: { c1: 0.15, c2: 0.30, c3: 0.10, c4: 0.10, c5: 0.25, c6: 0.10 },
    attributes: { c1: "benefit", c2: "benefit", c3: "benefit", c4: "benefit", c5: "benefit", c6: "cost" }
};

// --- FUNGSI MANAJEMEN DATA BERKAS FISIK JSON ---

// Fungsi untuk Akun Pengguna
const readUsers = () => {
    if (!fs.existsSync(usersFilePath)) {
        fs.writeFileSync(usersFilePath, JSON.stringify(defaultUsers, null, 2), 'utf-8');
        return defaultUsers;
    }
    return JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
};

const saveUsers = (data) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Fungsi untuk Pelamar (Alternatif)
const readApplicants = () => {
    if (!fs.existsSync(applicantsFilePath)) {
        fs.writeFileSync(applicantsFilePath, JSON.stringify(defaultApplicants, null, 2), 'utf-8');
        return defaultApplicants;
    }
    return JSON.parse(fs.readFileSync(applicantsFilePath, 'utf-8'));
};

const saveApplicants = (data) => {
    fs.writeFileSync(applicantsFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

// Fungsi untuk Konfigurasi Kriteria Metode TOPSIS [cite: 5]
const readCriteria = () => {
    if (!fs.existsSync(criteriaFilePath)) {
        fs.writeFileSync(criteriaFilePath, JSON.stringify(defaultCriteria, null, 2), 'utf-8');
        return defaultCriteria;
    }
    return JSON.parse(fs.readFileSync(criteriaFilePath, 'utf-8'));
};

const saveCriteria = (data) => {
    fs.writeFileSync(criteriaFilePath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = { readUsers, saveUsers, readApplicants, saveApplicants, readCriteria, saveCriteria };