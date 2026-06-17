const { Pool } = require('pg');

const isInternalConnection = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway.internal');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isInternalConnection ? false : { rejectUnauthorized: false }
});

const initDatabase = async () => {
  const queryCreateTableUsers = `
    CREATE TABLE IF NOT EXISTS users (
      email VARCHAR(255) PRIMARY KEY,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL
    );
  `;

  const queryCreateTableApplicants = `
    CREATE TABLE IF NOT EXISTS applicants (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      c1_gpa NUMERIC(4,2) NOT NULL,
      c2_portfolio INT NOT NULL,
      c3_experience INT NOT NULL,
      c4_merits INT NOT NULL,
      c5_skills INT NOT NULL,
      c6_salary INT NOT NULL,
      portfolio_url TEXT,
      cv_name TEXT,
      transcript_name TEXT,
      certs JSONB,
      awards JSONB,
      skills_list JSONB,
      status VARCHAR(50) DEFAULT 'Unverified',
      interview_details JSONB
    );
  `;

  try {
    const client = await pool.connect();
    
    // 1. Buat Tabel Jika Belum Ada
    await client.query(queryCreateTableUsers);
    await client.query(queryCreateTableApplicants);
    console.log('✅ PostgreSQL: Semua tabel siap digunakan!');

    // 2. AUTO SEEDER TABEL USERS: Cek apakah akun TA & Manager sudah ada
    const userCountResult = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCountResult.rows[0].count, 10) === 0) {
      console.log('🌱 Melakukan seeding akun default (TA & Manager)...');
      
      await client.query(`
        INSERT INTO users (email, password, role) VALUES 
        ('ta@perusahaan.com', 'passwordTA2026', 'Talent Acquisition'),
        ('manager@perusahaan.com', 'passwordManager2026', 'HR Manager')
      `);
      console.log('✅ Akun default TA & Manager berhasil dimasukkan!');
    }

    // 3. AUTO SEEDER TABEL APPLICANTS: Cek apakah pelamar A1-A10 sudah ada
    const applicantCountResult = await client.query('SELECT COUNT(*) FROM applicants');
    if (parseInt(applicantCountResult.rows[0].count, 10) === 0) {
      console.log('🌱 Melakukan seeding data pelamar bawaan (A1 - A10) untuk TOPSIS...');

      const defaultApplicants = [
        { email: "a1@test.com", name: "A1", category: "Final Year", c1_gpa: 3.92, c2_portfolio: 5, c3_experience: 4, c4_merits: 4, c5_skills: 5, c6_salary: 2000000, status: "Verified", interviewDetails: { isPassed: false, status: "Locked", date: "", time: "", link: "", rescheduleRequest: null } },
        { email: "a2@test.com", name: "A2", category: "Final Year", c1_gpa: 3.78, c2_portfolio: 4, c3_experience: 5, c4_merits: 5, c5_skills: 4, c6_salary: 1800000, status: "Verified", interviewDetails: { isPassed: false, status: "Locked", date: "", time: "", link: "", rescheduleRequest: null } },
        { email: "a3@test.com", name: "A3", category: "Final Year", c1_gpa: 3.55, c2_portfolio: 3, c3_experience: 3, c4_merits: 4, c5_skills: 4, c6_salary: 1500000, status: "Verified", interviewDetails: { isPassed: false, status: "Locked", date: "", time: "", link: "", rescheduleRequest: null } },
        { email: "a4@test.com", name: "A4", category: "Final Year", c1_gpa: 3.88, c2_portfolio: 5, c3_experience: 2, c4_merits: 3, c5_skills: 5, c6_salary: 2500000, status: "Verified", interviewDetails: { isPassed: true, status: "Scheduled", date: "2026-06-23", time: "01:00", link: "http://localhost:5173/manager/dashboard", rescheduleRequest: null } },
        { email: "a5@test.com", name: "A5", category: "Fresh Graduate", c1_gpa: 3.65, c2_portfolio: 4, c3_experience: 4, c4_merits: 5, c5_skills: 3, c6_salary: 1700000, status: "Verified", interviewDetails: { isPassed: false, status: "Locked", date: "", time: "", link: "", rescheduleRequest: null } },
        { email: "a6@test.com", name: "A6", category: "Fresh Graduate", c1_gpa: 3.96, c2_portfolio: 5, c3_experience: 5, c4_merits: 4, c5_skills: 5, c6_salary: 3000000, status: "Verified", interviewDetails: { isPassed: false, status: "Locked", date: "", time: "", link: "", rescheduleRequest: null } },
        { email: "a7@test.com", name: "A7", category: "Fresh Graduate", c1_gpa: 3.42, c2_portfolio: 3, c3_experience: 4, c4_merits: 2, c5_skills: 3, c6_salary: 1400000, status: "Verified", interviewDetails: { isPassed: false, status: "Locked", date: "", time: "", link: "", rescheduleRequest: null } },
        { email: "a8@test.com", name: "A8", category: "Fresh Graduate", c1_gpa: 3.75, c2_portfolio: 4, c3_experience: 3, c4_merits: 4, c5_skills: 4, c6_salary: 1600000, status: "Verified", interviewDetails: { isPassed: false, status: "Locked", date: "", time: "", link: "", rescheduleRequest: null } },
        { email: "a9@test.com", name: "A9", category: "Final Year", c1_gpa: 3.85, c2_portfolio: 5, c3_experience: 4, c4_merits: 5, c5_skills: 5, c6_salary: 2200000, status: "Verified", interviewDetails: { isPassed: true, status: "Scheduled", date: "2026-06-10", time: "02:00", link: "http://localhost:5173/manager/dashboard", rescheduleRequest: null } },
        { email: "maylinthelaw@gmail.com", name: "A10", category: "Final Year", c1_gpa: 3.5, c2_portfolio: 2, c3_experience: 3, c4_merits: 3, c5_skills: 3, c6_salary: 1300000, status: "Verified", interviewDetails: { isPassed: false, status: "Locked", date: "", time: "", link: "", rescheduleRequest: null } }
      ];

      const insertApplicantQuery = `
        INSERT INTO applicants (
          email, name, category, c1_gpa, c2_portfolio, c3_experience, c4_merits, c5_skills, c6_salary,
          portfolio_url, cv_name, transcript_name, certs, awards, skills_list, status, interview_details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `;

      for (const app of defaultApplicants) {
        await client.query(insertApplicantQuery, [
          app.email, app.name, app.category, app.c1_gpa, app.c2_portfolio, app.c3_experience,
          app.c4_merits, app.c5_skills, app.c6_salary, '', 'Curriculum_Vitae.pdf', 'Transkrip_Nilai_Terakhir.pdf',
          JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), app.status, JSON.stringify(app.interviewDetails)
        ]);
      }
      console.log('✅ Semua data pelamar A1 - A10 sukses dimasukkan ke PostgreSQL!');
    }

    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL: Gagal menginisialisasi tabel atau seeder:');
    console.error(err);
  }
};

module.exports = {
  pool,
  initDatabase
};