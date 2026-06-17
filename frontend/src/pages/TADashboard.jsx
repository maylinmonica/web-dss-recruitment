import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { 
  Cpu, Users, FileText, CheckCircle2, Clock, AlertTriangle, 
  ExternalLink, ClipboardCheck, ArrowRight, ArrowLeft, Terminal, HelpCircle, X,
  Coins 
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function TADashboard() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  
  // State manajemen penilaian rubrik kualitatif
  const [c2_portfolio, setC2Portfolio] = useState('3');
  const [c3_experience, setC3Experience] = useState('3');
  const [c4_merits, setC4Merits] = useState('3');
  const [c5_skills, setC5Skills] = useState('3');
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/applicants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'Success') {
        setApplicants(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Hambatan koordinasi data antrean pelamar:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const openAuditWorkspace = (applicant) => {
    setSelectedApplicant(applicant);
    setC2Portfolio(applicant.c2_portfolio?.toString() || '3');
    setC3Experience(applicant.c3_experience?.toString() || '3');
    setC4Merits(applicant.c4_merits?.toString() || '3');
    setC5Skills(applicant.c5_skills?.toString() || '3');
  };

  const handleVerifyScores = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setNotice(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/applicants/verify/${selectedApplicant.id}`,
        { c2_portfolio, c3_experience, c4_merits, c5_skills },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'Success') {
        setNotice(response.data.ui_notice);
        setSelectedApplicant(null);
        fetchApplicants();
      }
    } catch (error) {
      setNotice(error.response?.data?.ui_notice || {
        title: "Gagal Menyimpan Evaluasi",
        description: "Terjadi hambatan interaksi menuju repositori server lokal.",
        type: "error"
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row text-slate-800 font-sans antialiased relative selection:bg-sky-100 selection:text-slate-900 transform-gpu">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <Sidebar />

      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {notice && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`p-4 rounded-2xl border bg-white/90 backdrop-blur-md shadow-[0_20px_40px_rgba(15,23,42,0.08)] flex items-start gap-3.5 relative overflow-hidden ${notice.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${notice.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <div className="flex-shrink-0 pl-1">{notice.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}</div>
              <div className="flex-1 space-y-0.5 pr-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">{notice.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{notice.description}</p>
              </div>
              <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 absolute right-3 top-3"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {!selectedApplicant ? (
          
          // TAMPILAN INDEX: Tabel Antrean Utama Pelamar
          <main className="flex-1 p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-8 relative z-10 animate-in fade-in duration-150">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100 uppercase tracking-wide">Talent Pool Evaluation</div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tracking-tight">Panel Validasi Kualifikasi</h2>
              <p className="text-slate-500 text-xs sm:text-sm">Evaluasi kompetensi portofolio, rekam jejak capaian prestasi, serta tentukan bobot penilaian kualitatif berkas pelamar magang.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_12px_40px_rgba(15,23,42,0.02)] overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Berkas Masuk Pelamar</h3>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 rounded-md text-slate-600">{applicants.length} Berkas Total</span>
              </div>

              {loading ? (
                <div className="py-24 text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat Berkas Administrasi...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-4">Informasi Pelamar</th>
                        <th className="px-6 py-4">Kelompok Posisi &amp; Kompensasi</th>
                        <th className="px-6 py-4">IPK</th>
                        <th className="px-6 py-4">Status Berkas</th>
                        <th className="px-6 py-4 text-right">Aksi Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {applicants.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 text-sm">{app.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{app.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-medium text-slate-600">{app.category === 'Final Year' ? 'Mahasiswa Tingkat Akhir' : 'Lulusan Baru'}</div>
                            <div className="text-[11px] text-sky-600 font-mono font-semibold mt-0.5">Rp {app.c6_salary?.toLocaleString('id-ID')} / bln</div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{app.c1_gpa?.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${app.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'}`}>{app.status === 'Verified' ? 'Terverifikasi' : 'Belum Diaudit'}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {/* PERBAIKAN: Mengubah tombol hitam stark menjadi Biru Sky Brand Premium */}
                            <button onClick={() => openAuditWorkspace(app)} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 text-white hover:bg-sky-700 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm">{app.status === 'Verified' ? 'Tinjau Ulang' : 'Mulai Audit'}<ArrowRight className="w-3 h-3" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        ) : (
          
          // TAMPILAN WORKSPACE WORK-DESK: Lembar Review Berkas Utama & Input Rubrik
          <main className="flex-1 p-6 sm:p-10 max-w-5xl w-full mx-auto space-y-6 relative z-10 animate-in fade-in duration-150">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-0.5">
                <button 
                  onClick={() => setSelectedApplicant(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-sky-600 transition-colors uppercase tracking-wider mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Kembali Ke Antrean
                </button>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-950 tracking-tight">Lembar Peninjauan Berkas</h2>
                <p className="text-xs text-slate-400">Kandidat Aktif: <span className="font-semibold text-slate-600">{selectedApplicant.name} ({selectedApplicant.email})</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* PANEL KIRI: DOSSIER CAPAIAN & FILE ATTACHMENT PELAMAR */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* PERBAIKAN MASTER: Kartu summary diubah dari Hitam Pekat menjadi Putih Bersih dengan Accent Lembut (Bebas dari kode C1/C6) */}
                <div className="grid grid-cols-2 gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.01)]">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IPK Akademis Terakhir</span>
                    <p className="text-lg font-bold font-mono text-emerald-600">{selectedApplicant.c1_gpa?.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 4.00</span></p>
                  </div>
                  <div className="space-y-1 border-l border-slate-100 pl-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Coins className="w-3.5 h-3.5 text-sky-500" /> Ekspektasi Uang Saku</span>
                    <p className="text-lg font-bold font-mono text-sky-600">Rp {selectedApplicant.c6_salary?.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-normal">/ bln</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest block uppercase">Verifikasi Berkas Utama (Klik Tautan)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <a href={selectedApplicant.portfolioUrl} target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 hover:border-sky-400 rounded-2xl flex items-center justify-between text-xs font-semibold text-sky-600 shadow-sm group transition-all"><span className="truncate">Portofolio Kode</span><ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0" /></a>
                    <a href={`${API_BASE_URL}/uploads/${selectedApplicant.cvName}`} target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 hover:border-sky-400 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 shadow-sm group transition-all"><span className="truncate">Dokumen CV</span><ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0" /></a>
                    <a href={`${API_BASE_URL}/uploads/${selectedApplicant.transcriptName}`} target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 hover:border-sky-400 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 shadow-sm group transition-all"><span className="truncate">Transkrip Nilai</span><ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0" /></a>
                  </div>
                </div>

                {/* TECH STACK VISUAL CHIPS */}
                <div className="space-y-2 bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Fokus Penguasaan Teknologi &amp; Rumpun Keahlian</span>
                  {selectedApplicant.skillsList && selectedApplicant.skillsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedApplicant.skillsList.map((s, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg shadow-sm">{s}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic pt-1">Pelamar tidak melampirkan fokus keahlian tambahan spesifik.</p>
                  )}
                </div>

                {/* METADATA DESKRIPSI SERTIFIKAT & PIAGAM */}
                <div className="border border-slate-200/60 bg-white p-5 rounded-2xl space-y-4 shadow-sm">
                  <div>
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 uppercase tracking-wide inline-block mb-2">Sertifikasi ({selectedApplicant.certs?.length || 0} Dokumen)</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {selectedApplicant.certs && selectedApplicant.certs.length > 0 && selectedApplicant.certs[0].name !== '' ? (
                        selectedApplicant.certs.map((c, i) => <div key={i} className="text-xs text-slate-600 border-l-2 border-slate-200 pl-2 py-0.5"><span className="font-bold text-slate-800">{c.name}</span> ({c.issuer}) <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{c.description}</p></div>)
                      ) : (
                        <p className="text-xs text-slate-400 italic pl-2">Tidak melampirkan berkas sertifikat tambahan.</p>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100 rounded px-2 py-0.5 uppercase tracking-wide inline-block mb-2">Piagam Penghargaan &amp; Rekam Jejak Prestasi ({selectedApplicant.awards?.length || 0} Dokumen)</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {selectedApplicant.awards && selectedApplicant.awards.length > 0 && selectedApplicant.awards[0].title !== '' ? (
                        selectedApplicant.awards.map((a, i) => <div key={i} className="text-xs text-slate-600 border-l-2 border-slate-200 pl-2 py-0.5"><span className="font-bold text-slate-800">{a.title}</span> ({a.eventName}) <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{a.description}</p></div>)
                      ) : (
                        <p className="text-xs text-slate-400 italic pl-2">Tidak melampirkan piagam penghargaan kompetisi.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* PANEL KANAN: INPUT RUBRIK & SMART EVALUATION SYSTEM */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                  <form onSubmit={handleVerifyScores} className="space-y-4">
                    
                    <div className="p-3.5 bg-sky-50/50 border border-sky-100 rounded-xl flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-sky-900 leading-relaxed">
                        <span className="font-bold">Asistensi Penilaian:</span> Berikan poin 4-5 jika portofolio pelamar interaktif (terkoneksi REST API), memiliki sertifikasi industri (BNSP/AWS), atau melampirkan rekam jejak juara nasional.
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Kualitas Kompleksitas Portofolio</label>
                      <select value={c2_portfolio} onChange={(e) => setC2Portfolio(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500">
                        <option value="1">1 - Statis / Tidak Responsif</option>
                        <option value="2">2 - UI Dasar Terpenuhi</option>
                        <option value="3">3 - Interaktif &amp; Menggunakan REST API</option>
                        <option value="4">4 - Arsitektur Bersih &amp; State Management</option>
                        <option value="5">5 - Aplikasi Skala Produksi &amp; Keamanan Tinggi</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Pengalaman Relevan &amp; Kepemimpinan Proyek</label>
                      <select value={c3_experience} onChange={(e) => setC3Experience(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500">
                        <option value="1">1 - Belum Memiliki Pengalaman Kerja/Proyek</option>
                        <option value="2">2 - Terlibat Proyek Tugas Kuliah Dasar</option>
                        <option value="3">3 - Pernah Memimpin Proyek Akademis Utama</option>
                        <option value="4">4 - Pengalaman Magang Industri &lt; 6 Bulan</option>
                        <option value="5">5 - Pengalaman Kerja Riil &gt; 1 Tahun / Freelance Solid</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Relevansi Capaian Penghargaan &amp; Prestasi</label>
                      <select value={c4_merits} onChange={(e) => setC4Merits(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500">
                        <option value="1">1 - Tidak Melampirkan Piagam Penghargaan</option>
                        <option value="2">2 - Memiliki 1-2 Penghargaan Tingkat Internal Kampus</option>
                        <option value="3">3 - Memiliki 1 Piagam Juara / Finalis Tingkat Nasional</option>
                        <option value="4">4 - Akumulasi Multi-Juara (Juara 2/3 Kompetisi Nasional)</option>
                        <option value="5">5 - Akumulasi Juara Sempurna (Juara 1 Nasional / Internasional)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Akreditasi Sertifikasi Keahlian Teknis</label>
                      <select value={c5_skills} onChange={(e) => setC5Skills(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500">
                        <option value="1">1 - Tidak Melampirkan Sertifikat Keahlian</option>
                        <option value="2">2 - Memiliki Sertifikat Partisipasi Webinar / Workshop</option>
                        <option value="3">3 - Memiliki Sertifikat Kelulusan Kursus/Bootcamp Eksternal</option>
                        <option value="4">4 - Memiliki Sertifikasi Industri Nasional Resmi / BNSP</option>
                        <option value="5">5 - Memiliki Sertifikasi Vendor Global (AWS/Google Cloud)</option>
                      </select>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                      <button type="button" onClick={() => setSelectedApplicant(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-bold uppercase tracking-wide transition-colors">Batal</button>
                      {/* PERBAIKAN: Mengubah tombol submit hitam stark menjadi Biru Sky Brand Premium */}
                      <button type="submit" disabled={submitLoading} className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-sm flex items-center gap-1.5">
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        {submitLoading ? 'Menyimpan...' : 'Kunci Skor'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </main>
        )}
      </div>

    </div>
  );
}

export default TADashboard;