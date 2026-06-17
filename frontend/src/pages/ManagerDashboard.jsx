import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import {
  TrendingUp, Filter, RefreshCw, Award, X, CheckCircle2, 
  AlertTriangle, Calendar, Clock, Video, ExternalLink, 
  FileText, FileCheck, Terminal, ArrowLeft, ArrowRight
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function ManagerDashboard() {
  const [category, setCategory] = useState('All');
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [scheduleModal, setScheduleModal] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', link: '' });
  const [decisionLoading, setDecisionLoading] = useState(null);

  const token = localStorage.getItem('token');

  const fetchRanking = async (cat) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/applicants/ranking`, {
        params: { category: cat },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'Success') {
        setRanking(res.data.ranking || []);
      }
    } catch (err) {
      setNotice({
        title: 'Gagal Memuat Peringkat',
        description: 'Tidak dapat terhubung ke server perhitungan nilai kualifikasi.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchApplicantDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/applicants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'Success') {
        setSelectedApplicant(res.data.data);
      }
    } catch (err) {
      setNotice({
        title: 'Gagal Memuat Berkas',
        description: 'Gagal mengunduh dokumen kualifikasi lengkap pelamar dari server.',
        type: 'error'
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDecision = async (id, decision, extra = {}) => {
    setDecisionLoading(id);
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/applicants/decision/${id}`,
        { decision, ...extra },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status === 'Success') {
        setNotice(res.data.ui_notice);
        fetchRanking(category);
        setScheduleModal(null);
        setSelectedApplicant(null);
        setScheduleForm({ date: '', time: '', link: '' });
      }
    } catch (err) {
      setNotice({
        title: 'Gagal Memproses Keputusan',
        description: 'Terjadi kesalahan saat menyimpan status kelayakan kandidat.',
        type: 'error'
      });
    } finally {
      setDecisionLoading(null);
    }
  };

  const handleApproveSubmit = (e) => {
    e.preventDefault();
    handleDecision(scheduleModal.id, 'Approved', scheduleForm);
  };

  useEffect(() => { 
    fetchRanking(category); 
  }, [category]);

  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(t);
    }
  }, [notice]);

  const formatRupiah = (number) => {
    if (!number) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const maxPref = ranking.length > 0 ? Math.max(...ranking.map(r => parseFloat(r.preference))) : 1;

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row text-slate-800 font-sans antialiased relative selection:bg-sky-100 selection:text-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {notice && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`p-4 rounded-2xl border bg-white/90 backdrop-blur-md shadow-lg flex items-start gap-3.5 relative overflow-hidden ${notice.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${notice.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <div className="shrink-0 pl-1">{notice.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}</div>
              <div className="flex-1 space-y-0.5 pr-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">{notice.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{notice.description}</p>
              </div>
              <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 absolute right-3 top-3"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {!selectedApplicant ? (
          <main className="main-workspace-container flex-1 p-6 sm:p-10 space-y-8 relative z-10 animate-in fade-in duration-150">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100 uppercase tracking-wide">Panel Manajer Pembuat Keputusan</div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tracking-tight">Dashboard Perankingan Rekomendasi</h2>
              <p className="text-slate-500 text-xs sm:text-sm">Pantau hasil rekomendasi otomatisasi peringkat pelamar magang berdasarkan bobot kriteria aktif.</p>
            </div>

            {/* FILTER KATEGORI */}
            <div className="flex items-center gap-2.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <div className="inline-flex bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                <button onClick={() => setCategory('All')} className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all ${category === 'All' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Semua Kategori</button>
                <button onClick={() => setCategory('Final Year')} className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all ${category === 'Final Year' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Mahasiswa Tingkat Akhir</button>
                <button onClick={() => setCategory('Fresh Graduate')} className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all ${category === 'Fresh Graduate' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Lulusan Baru</button>
              </div>
              <button onClick={() => fetchRanking(category)} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-sky-400 rounded-full text-[11px] font-bold text-slate-500 hover:text-sky-600 transition-all shadow-sm"><RefreshCw className="w-3.5 h-3.5" /> Segarkan Halaman</button>
            </div>

            {/* GRAFIK PREFERENSI */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_12px_40px_rgba(15,23,42,0.02)] overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5"><TrendingUp className="w-4 h-4 text-sky-500" /><h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Visualisasi Nilai Kelayakan Kelompok</h3></div>
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-sky-50 border border-sky-100 rounded-md text-sky-700">{ranking.length} Kandidat Terdaftar</span>
              </div>
              <div className="p-6 space-y-3">
                {loading ? (
                  <div className="py-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Menghitung matriks preferensi berkas...</div>
                ) : ranking.length === 0 ? (
                  <div className="py-16 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Belum Ada Pelamar Berstatus Terverifikasi</div>
                ) : (
                  ranking.map((r, idx) => (
                    <div key={r.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">{idx < 3 && <Award className={`w-3.5 h-3.5 ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-400' : 'text-amber-700/60'}`} />}{r.name}</span>
                        <span className="font-mono font-bold text-slate-900">{(parseFloat(r.preference) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-sky-500' : idx < 3 ? 'bg-sky-300' : 'bg-slate-300'}`} style={{ width: `${(parseFloat(r.preference) / maxPref) * 100}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* TABEL URUTAN REKOMENDASI KANDIDAT */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_12px_40px_rgba(15,23,42,0.02)] overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50"><Award className="w-4 h-4 text-sky-500" /><h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Tabel Urutan Urgensi Hasil Seleksi</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4">Peringkat</th>
                      <th className="px-6 py-4">Nama Kandidat</th>
                      <th className="px-6 py-4">Jarak Batas Atas</th>
                      <th className="px-6 py-4">Jarak Batas Bawah</th>
                      <th className="px-6 py-4">Nilai Kecocokan</th>
                      <th className="px-6 py-4">Status Keputusan</th> {/* PERBAIKAN KOSTUMISASI KOLOM BARU */}
                      <th className="px-6 py-4 text-right">Aksi Peninjauan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {ranking.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">#{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 text-sm">{r.name}</div>
                          {r.interviewDetails?.rescheduleRequest?.requested && (
                            <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 text-amber-950 rounded-xl text-[10px] inline-flex items-center gap-1.5 max-w-sm animate-pulse"><AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" /><span>Mengajukan Perubahan Jadwal Sesi</span></div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.d_plus}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{r.d_minus}</td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{r.preference}</td>
                        
                        {/* PERBAIKAN: MENAMPILKAN BADGE STATUS KEPUTUSAN KANDIDAT SECARA SCANNABLE */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            r.interviewDetails?.status === 'Scheduled' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            r.interviewDetails?.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                          }`}>
                            {r.interviewDetails?.status === 'Scheduled' ? 'Disetujui Wawancara' :
                             r.interviewDetails?.status === 'Rejected' ? 'Berkas Ditolak' : 'Menunggu Keputusan'}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {/* PERBAIKAN UX: Merubah gaya tombol secara dinamis berdasarkan status riwayat periksa */}
                          <button 
                            onClick={() => handleFetchApplicantDetail(r.id)} 
                            disabled={detailLoading} 
                            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${
                              r.interviewDetails?.status && r.interviewDetails.status !== 'Locked'
                                ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                                : 'bg-sky-600 text-white hover:bg-sky-700'
                            }`}
                          >
                            {r.interviewDetails?.status && r.interviewDetails.status !== 'Locked' ? 'Tinjau Ulang' : 'Evaluasi Berkas'}
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        ) : (
          
          /* CONDITION 2: INLINE ACCESSIBLE WORKSPACE VIEW FOR MANAGER */
         <main className="main-workspace-container flex-1 p-6 sm:p-10 space-y-6 relative z-10 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="space-y-0.5">
                <button onClick={() => setSelectedApplicant(null)} className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-sky-600 transition-colors uppercase tracking-wider mb-1"><ArrowLeft className="w-3.5 h-3.5" /> Kembali Ke Pemeringkatan</button>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-950 tracking-tight">Audit Dokumen Rekrutmen</h2>
                <p className="text-xs text-slate-400">Kandidat Aktif: <span className="font-semibold text-slate-600">{selectedApplicant.name} ({selectedApplicant.email})</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Verifikasi Berkas Utama (Klik Tautan)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <a href={selectedApplicant.portfolioUrl} target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 hover:border-sky-400 rounded-2xl flex items-center justify-between text-xs font-semibold text-sky-600 shadow-sm group transition-all"><span className="truncate">Portofolio Kode</span><ExternalLink className="w-3 h-3 text-slate-400 shrink-0" /></a>
                    <a href={`${API_BASE_URL}/uploads/${selectedApplicant.cvName}`} target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 hover:border-sky-400 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 shadow-sm group transition-all"><span className="truncate">Dokumen CV</span><ExternalLink className="w-3 h-3 text-slate-400 shrink-0" /></a>
                    <a href={`${API_BASE_URL}/uploads/${selectedApplicant.transcriptName}`} target="_blank" rel="noreferrer" className="p-3 bg-white border border-slate-200 hover:border-sky-400 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 shadow-sm group transition-all"><span className="truncate">Transkrip Nilai</span><ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0" /></a>
                  </div>
                </div>

                <div className="space-y-2 bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Rumpun Keahlian Utama</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedApplicant.skillsList && selectedApplicant.skillsList.length > 0 ? (
                      selectedApplicant.skillsList.map((s, idx) => <span key={idx} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg">{s}</span>)
                    ) : (
                      <span className="text-xs text-slate-400 italic">Tidak melampirkan fokus keahlian tambahan.</span>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200/60 bg-white p-5 rounded-2xl space-y-4 shadow-sm">
                  <div>
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5 uppercase tracking-wide inline-block mb-2">Sertifikasi ({selectedApplicant.certs?.length || 0} Dokumen)</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedApplicant.certs && selectedApplicant.certs.length > 0 && selectedApplicant.certs[0].name !== '' ? selectedApplicant.certs.map((c, i) => <div key={i} className="text-xs text-slate-600 border-l-2 border-slate-200 pl-2 py-0.5"><span className="font-bold text-slate-800">{c.name}</span> ({c.issuer}) <p className="text-[10px] text-slate-400 mt-0.5">{c.description}</p></div>) : <p className="text-xs text-slate-400 italic pl-2">Tidak ada dokumen sertifikasi pendukung.</p>}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100 rounded px-2 py-0.5 uppercase tracking-wide inline-block mb-2">Piagam Penghargaan ({selectedApplicant.awards?.length || 0} Dokumen)</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedApplicant.awards && selectedApplicant.awards.length > 0 && selectedApplicant.awards[0].title !== '' ? selectedApplicant.awards.map((a, i) => <div key={i} className="text-xs text-slate-600 border-l-2 border-slate-200 pl-2 py-0.5"><span className="font-bold text-slate-800">{a.title}</span> ({a.eventName}) <p className="text-[10px] text-slate-400 mt-0.5">{a.description}</p></div>) : <p className="text-xs text-slate-400 italic pl-2">Tidak ada piagam penghargaan.</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5"><FileCheck className="w-4 h-4 text-sky-500" /> Ringkasan Skor Kualifikasi</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div><span className="text-slate-400 block">IPK Akhir Pelamar:</span><span className="font-mono font-bold text-slate-900 text-sm">{selectedApplicant.c1_gpa?.toFixed(2)}</span></div>
                    <div><span className="text-slate-400 block">Ekspektasi Uang Saku:</span><span className="font-mono font-bold text-slate-900 text-sm">{formatRupiah(selectedApplicant.c6_salary)}</span></div>
                  </div>

                  {selectedApplicant.interviewDetails?.rescheduleRequest?.requested && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div><span className="font-bold block mb-0.5">Pengajuan Perubahan Jadwal:</span>"{selectedApplicant.interviewDetails.rescheduleRequest.reason}"</div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {selectedApplicant.interviewDetails?.status === 'Scheduled' ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs text-center font-semibold">Kandidat ini telah disetujui untuk tahap wawancara.</div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => handleDecision(selectedApplicant.id, 'Rejected')} className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-full text-xs font-bold uppercase tracking-wide transition-colors">Ubah Jadi Tolak</button>
                          <button onClick={() => setScheduleModal({ id: selectedApplicant.id, name: selectedApplicant.name })} className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors">Sesuaikan Jadwal</button>
                        </div>
                      </div>
                    ) : selectedApplicant.interviewDetails?.status === 'Rejected' ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs text-center font-semibold">Kandidat ini telah ditandai Tidak Lolos berkas administrasi.</div>
                        <button onClick={() => setScheduleModal({ id: selectedApplicant.id, name: selectedApplicant.name })} className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wide transition-colors">Ubah Jadi Setujui</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button onClick={() => handleDecision(selectedApplicant.id, 'Rejected')} disabled={decisionLoading === selectedApplicant.id} className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-full text-xs font-bold uppercase tracking-wide transition-colors">Tolak Kandidat</button>
                        <button onClick={() => setScheduleModal({ id: selectedApplicant.id, name: selectedApplicant.name })} disabled={decisionLoading === selectedApplicant.id} className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold uppercase tracking-wide transition-colors">Setujui &amp; Jadwalkan</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      {/* MODAL PENJADWALAN */}
      {scheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="space-y-1"><h3 className="text-sm font-bold font-display text-slate-950 flex items-center gap-2"><Video className="w-4 h-4 text-slate-500" /> Tentukan Jadwal Wawancara</h3><p className="text-xs text-slate-400">Kandidat Terpilih: <span className="font-semibold text-slate-700">{scheduleModal.name}</span></p></div>
            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div className="space-y-1.5"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Tanggal Pertemuan</label><input type="date" required value={scheduleForm.date} onChange={(e) => setScheduleForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none" /></div>
              <div className="space-y-1.5"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Waktu Pelaksanaan</label><input type="time" required value={scheduleForm.time} onChange={(e) => setScheduleForm(f => ({ ...f, time: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none" /></div>
              <div className="space-y-1.5"><label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Tautan Konferensi Video (Google Meet)</label><input type="url" required placeholder="https://meet.google.com/abc-defg-hij" value={scheduleForm.link} onChange={(e) => setScheduleForm(f => ({ ...f, link: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none" /></div>
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setScheduleModal(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-bold uppercase tracking-wide transition-colors">Batal</button>
                <button type="submit" disabled={decisionLoading === scheduleModal.id} className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-sm flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Konfirmasi &amp; Setujui</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;