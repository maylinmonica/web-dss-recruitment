const { Pool } = require('pg');

// Deteksi otomatis apakah koneksi menggunakan jalur internal rahasia Railway
const isInternalConnection = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('railway.internal');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // PERBAIKAN: Jika internal = false (tanpa SSL), jika lokal/publik laptop = pakai SSL
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
    
    // Eksekusi pembuatan tabel satu per satu
    await client.query(queryCreateTableUsers);
    await client.query(queryCreateTableApplicants);
    
    console.log('✅ PostgreSQL: Semua tabel siap digunakan!');
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL: Gagal menginisialisasi tabel:');
    console.error(err); // Menampilkan objek error utuh agar terbaca detail kendalanya
  }
};

module.exports = {
  pool,
  initDatabase
};