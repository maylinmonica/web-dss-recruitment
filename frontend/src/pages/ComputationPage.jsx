import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Calculator, X, CheckCircle2, AlertTriangle, Filter, RefreshCw, Layers, Server, ShieldCheck, Settings } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const CRITERIA_LABELS = {
  c1: 'Indeks Prestasi Kumulatif (IPK)', 
  c2: 'Kualitas Portofolio Teknis', 
  c3: 'Pengalaman Organisasi / Proyek',
  c4: 'Nilai Tambah Dokumen Pendukung', 
  c5: 'Kesesuaian Spesifikasi Keahlian', 
  c6: 'Ekspektasi Uang Saku / Gaji'
};

const COL_KEYS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];

function ComputationPage() {
  const [category, setCategory] = useState('Final Year');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const token = localStorage.getItem('token');

  const fetchData = async (cat) => {
    setLoading(true);
    try {
      const res = await axios.get('${API_BASE_URL}/api/applicants/ranking', {
        params: { category: cat },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'Success') setData(res.data);
    } catch (err) {
      setNotice({ title: 'Gagal Memuat', description: 'Hubungan interaksi menuju server mesin TOPSIS terputus.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(category); 
  }, [category]);

  const ranking = data?.ranking || [];
  const ideals  = data?.ideals  || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/40 via-[#F5F7FB] to-[#F5F7FB] flex flex-col md:flex-row text-slate-800 font-sans antialiased selection:bg-sky-100 selection:text-slate-900">
      
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* LEBAR MAINDESK DIKUNCI MAKSIMAL 5XL AGAR SEJAJAR DENGAN DASHBOARD KANAN LAIN */}
        <main className="main-workspace-container flex-1 p-6 sm:p-10 space-y-8 relative z-10 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* SINKRONISASI BADGE IDENTITAS WARNA MENJADI BIRU SKY */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-100 uppercase tracking-wide">Panel Manajer Pembuat Keputusan</div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tracking-tight">Portal Audit Rumus TOPSIS</h2>
              <p className="text-slate-500 text-xs sm:text-sm">Memeriksa tahapan kalkulasi matematis metode rekrutmen guna memvalidasi hasil rekomendasi secara empiris.</p>
            </div>
            
            {/* SINKRONISASI FRASA TEKS FILTER BERBAHASA INDONESIA BAKU */}
            <div className="inline-flex bg-white border border-slate-200 rounded-full p-1 shadow-sm shrink-0">
              <button onClick={() => setCategory('Final Year')} className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all ${category === 'Final Year' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Mahasiswa Tingkat Akhir</button>
              <button onClick={() => setCategory('Fresh Graduate')} className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all ${category === 'Fresh Graduate' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Lulusan Baru</button>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Menghitung Data Komputasi...</div>
          ) : ranking.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/60 p-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Belum Ada Pelamar Berstatus Terverifikasi</div>
          ) : (
            <>
              {/* LANGKAH 1 */}
              <Section step="1" title="Formula Dasar Metode TOPSIS" icon={<Calculator className="w-4 h-4 text-slate-600" />}>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Normalisasi Vektor', formula: 's_ij = x_ij / √(Σ x_kj²)', desc: 'Setiap nilai pembentuk matriks dibagi akar dari jumlah kuadrat seluruh nilai kolom alternatif.' },
                    { label: 'Matriks Terbobot (Y)', formula: 'y_ij = w_j × s_ij', desc: 'Hasil nilai vektor normalisasi dikalikan dengan besaran persentase bobot kriteria kepentingan.' },
                    { label: 'Solusi Ideal Positif (A+)', formula: 'A⁺ = { max y | benefit, min y | cost }', desc: 'Pengambilan nilai performa terbaik dari matriks terbobot berdasarkan jenis atribut.' },
                    { label: 'Solusi Ideal Negatif (A−)', formula: 'A⁻ = { min y | benefit, max y | cost }', desc: 'Pengambilan nilai performa terburuk dari matriks terbobot berdasarkan jenis atribut.' },
                    { label: 'Jarak Jauh Euclidean (D)', formula: 'D = √Σ(y_ij − A_j)²', desc: 'Pengukuran jarak geometris kedekatan berkas pelamar terhadap batas ideal positif dan negatif.' },
                    { label: 'Preferensi Akhir (V)', formula: 'V = D⁻ / (D⁺ + D⁻)', desc: 'Kalkulasi rasio kelayakan. Semakin mendekati angka 1.0000, kedekatan berkas semakin direkomendasikan.' },
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-sky-50/40 border border-sky-100 rounded-2xl space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">{item.label}</p>
                      <code className="block text-xs font-mono font-bold text-slate-900 bg-white border border-sky-100 rounded-xl px-3 py-2">{item.formula}</code>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
         
              </Section>

              {/* LANGKAH 2 */}
              <Section step="2" title="Konfigurasi Bobot &amp; Atribut Kriteria Aktif" icon={<Settings className="w-4 h-4 text-slate-400" />}>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                  <table className="w-full tbl text-left border-collapse">
                    <thead><tr className="bg-slate-50/50 border-b border-slate-100">
                      <th>Kode</th><th>Nama Kriteria Penilaian</th><th>Bobot Desimal (w)</th><th>Bobot Persentase</th><th>Jenis Atribut</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {data?.criteriaUsed?.map((c, i) => (
                        <tr key={i}>
                          <td className="font-mono font-bold text-slate-900">{c.key.toUpperCase()}</td>
                          <td className="font-semibold text-slate-900">{CRITERIA_LABELS[c.key]}</td>
                          <td className="font-mono text-slate-600">{parseFloat(c.weight).toFixed(2)}</td>
                          <td className="font-mono text-slate-900 font-semibold">{(parseFloat(c.weight)*100).toFixed(0)}%</td>
                          <td><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.attribute === 'benefit' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>{c.attribute === 'benefit' ? 'Benefit' : 'Cost'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              {/* LANGKAH 3 */}
              <Section step="3" title="Matriks Keputusan Awal (X)" icon={<Server className="w-4 h-4 text-slate-400" />}>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                  <table className="w-full tbl text-left border-collapse">
                    <thead><tr className="bg-slate-50/50 border-b border-slate-100">
                      <th>Nama Kandidat Alternatif</th>
                      {COL_KEYS.map(k => <th key={k}>{k.toUpperCase()}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {data?.decisionMatrix?.map((row, i) => (
                        <tr key={i}>
                          <td className="font-semibold text-slate-900">{row.name}</td>
                          {COL_KEYS.map(k => <td key={k} className="font-mono text-slate-600">{row.values[k] !== undefined ? parseFloat(row.values[k]).toFixed(2) : '0.00'}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              {ideals.length > 0 && (
                <Section step="4" title="Titik Solusi Ideal Batas Atas (A+) &amp; Batas Bawah (A−)" icon={<ShieldCheck className="w-4 h-4 text-slate-400" />}>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                    <table className="w-full tbl text-left border-collapse">
                      <thead><tr className="bg-slate-50/50 border-b border-slate-100">
                        <th>Kategori Batas Solusi</th>
                        {COL_KEYS.map(k => <th key={k}>{k.toUpperCase()}</th>)}
                      </tr></thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">A+ (Solusi Ideal Positif)</span></td>
                          {ideals.map((ideal, i) => <td key={i} className="font-mono font-bold text-emerald-700">{ideal.pos.toFixed(6)}</td>)}
                        </tr>
                        <tr>
                          <td><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-100">A− (Solusi Ideal Negatif)</span></td>
                          {ideals.map((ideal, i) => <td key={i} className="font-mono font-bold text-rose-600">{ideal.neg.toFixed(6)}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}

              {/* LANGKAH 5 */}
              <Section step={ideals.length > 0 ? "5" : "4"} title="Hasil Akhir Nilai Preferensi Kelayakan (V)" icon={<Layers className="w-4 h-4 text-slate-400" />}>
                <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-sm">
                  <table className="w-full tbl text-left border-collapse">
                    <thead><tr className="bg-slate-50/50 border-b border-slate-100">
                      <th>Peringkat</th><th>Nama Kandidat Pelamar</th>
                      <th>Jarak Positif (D⁺)</th>
                      <th>Jarak Negatif (D⁻)</th>
                      <th>Preferensi Akhir (V)</th>
                      <th>Status Sistem</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {ranking.map((r, idx) => (
                        <tr key={r.id}>
                          <td className="font-mono font-bold text-slate-900">#{idx+1}</td>
                          <td className="font-semibold text-slate-900">{r.name}</td>
                          <td className="font-mono text-rose-600 font-medium">{r.d_plus}</td>
                          <td className="font-mono text-emerald-600 font-medium">{r.d_minus}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-slate-900 w-12">{r.preference}</span>
                              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                <div className="h-full bg-slate-950 rounded-full" style={{ width: `${parseFloat(r.preference) * 100}%` }} />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">{(parseFloat(r.preference)*100).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${idx < 3 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{idx < 3 ? 'Rekomendasi Utama' : 'Cadangan Sesi'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}


const STEP_ACCENTS = {
  1: 'bg-sky-50 text-sky-700 border-sky-100',
  2: 'bg-violet-50 text-violet-700 border-violet-100',
  3: 'bg-amber-50 text-amber-700 border-amber-100',
  4: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  5: 'bg-sky-50 text-sky-700 border-sky-100',
};

// SINKRONISASI BADGE IDENTITY WARNA MENJADI SLATE KONSISTEN
function Section({ step, title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_12px_40px_rgba(15,23,42,0.02)] overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border bg-sky-50 text-sky-700 border-sky-100 uppercase">Langkah {step}</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">{title}</h3>
        </div>
        {icon}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default ComputationPage;