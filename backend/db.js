const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // Tambahan: Untuk enkripsi password default seeder

// Deteksi otomatis apakah koneksi menggunakan jalur internal rahasia Railway
const isInternalConnection = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway.internal');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isInternalConnection ? false : { rejectUnauthorized: false }
});

// Skrip SQL otomatis untuk membangun tabel database rekrutmen
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
    
    // 1. Eksekusi pembuatan tabel satu per satu
    await client.query(queryCreateTableUsers);
    await client.query(queryCreateTableApplicants);
    console.log('✅ PostgreSQL: Semua tabel siap digunakan!');

    // 2. DATABASE SEEDER: Suntik Akun Default Secara Otomatis Jika Belum Ada
    const defaultUsers = [
        { email: 'ta@perusahaan.com', password: 'passwordTA2026', role: 'Talent Acquisition' },
        { email: 'manager@perusahaan.com', password: 'passwordManager2026', role: 'HR Manager' }
    ];

    for (const user of defaultUsers) {
        // Cek apakah user sudah ada di database agar tidak duplikat
        const userCheck = await client.query('SELECT email FROM users WHERE LOWER(email) = LOWER($1)', [user.email]);
        
        if (userCheck.rows.length === 0) {
            // Hash password default dengan bcrypt agar aman
            const salt = await bcrypt.genSalt(10);
            const hashedPw = await bcrypt.hash(user.password, salt);
            
            // Masukkan data akun default ke dalam tabel
            await client.query(
                'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
                [user.email.toLowerCase(), hashedPw, user.role]
            );
            console.log(`🌱 Database Seeder: Berhasil menanam akun default [${user.role}]`);
        }
    }
    
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL: Gagal menginisialisasi tabel:');
    console.error(err);
  }
};

module.exports = {
  pool,
  initDatabase
};