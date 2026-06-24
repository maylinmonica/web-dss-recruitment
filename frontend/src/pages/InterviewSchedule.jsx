import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Calendar, Clock, Video, Lock, ExternalLink, Info, CheckCircle2, X, Send } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function InterviewSchedule() {
  const [applicantData, setApplicantData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk fitur permohonan perubahan jadwal
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [submittingReschedule, setSubmittingReschedule] = useState(false);
  const [notice, setNotice] = useState(null);

  const navigate = useNavigate();

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/applicants/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'Success') {
        setApplicantData(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Gagal memuat jadwal wawancara pelamar:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token || role !== 'Applicant') {
      localStorage.clear();
      navigate('/login');
      return;
    }

    fetchStatus();
  }, [navigate]);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  // Handler simulasi pengiriman email / permohonan perubahan jadwal ke sistem
  const handleRequestReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleReason.trim()) return;

    setSubmittingReschedule(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        '${API_BASE_URL}/api/applicants/reschedule-request',
        { reason: rescheduleReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'Success') {
        setNotice(response.data.ui_notice);
        setRescheduleReason('');
        fetchStatus(); // Sinkronisasi ulang data terbaru kalender dari server
      }
    } catch (error) {
      setNotice(error.response?.data?.ui_notice || {
        title: "Gagal Mengirim",
        description: "Terjadi hambatan koneksi saat mengirim permohonan perubahan jadwal.",
        type: "error"
      });
    } finally {
      setSubmittingReschedule(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row text-slate-800 font-sans antialiased selection:bg-sky-100 selection:text-slate-900 transform-gpu">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <Sidebar />

      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Sistem Notifikasi Toast */}
        {notice && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`p-4 rounded-2xl border bg-white/90 backdrop-blur-md shadow-[0_20px_40px_rgba(15,23,42,0.08)] flex items-start gap-3.5 relative overflow-hidden ${notice.type === 'success' ? 'border-emerald-100' : 'border-rose-100'}`}>
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

        <main className="flex-1 p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-8 z-10">
          
          {/* HEADER SEKSI — UX WRITER STANDARD: DIUBAH DARI KONFIRMASI MENJADI INFORMASI LUGAS */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100 uppercase tracking-wide">Tahap Wawancara</div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tracking-tight">Sesi Jadwal Pertemuan</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Melihat informasi tanggal pelaksanaan serta tautan pertemuan virtual untuk sesi wawancara bersama tim penguji.</p>
          </div>

          {/* PERCABANGAN STATE LAYOUT */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200/60 p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="animate-pulse">Memuat Jadwal Pertemuan...</span>
            </div>
          ) : !applicantData ? (
            
            // KONDISI AWAL: Pelamar belum mengirimkan berkas formulir sama sekali
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-12 shadow-[0_12px_40px_rgba(15,23,42,0.02)] flex flex-col items-center justify-center text-center space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 shadow-sm"><Lock className="w-6 h-6" /></div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">Formulir Belum Lengkap</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                  Informasi wawancara belum tersedia. Silakan lengkapi dan kirim berkas pendaftaran Anda terlebih dahulu agar dapat diproses ke tahapan verifikasi dokumen.
                </p>
              </div>
              <Link to="/apply" className="inline-flex items-center justify-center bg-slate-950 hover:bg-sky-600 text-white font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm">Buka Formulir</Link>
            </div>

          ) : applicantButtonState(applicantData) === "LOCKED_BY_TA" ? (
            
            // KONDISI KEDUA: Berkas sudah dikirim, tapi tim TA belum selesai melakukan audit
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-12 shadow-[0_12px_40px_rgba(15,23,42,0.02)] flex flex-col items-center justify-center text-center space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 shadow-sm"><Clock className="w-6 h-6" /></div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">Proses Verifikasi Berkas</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                  Berkas pendaftaran Anda telah berhasil disimpan. Saat ini dokumen Anda sedang dalam proses pemeriksaan kelayakan oleh tim Talent Acquisition.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-2.5 text-[11px] text-slate-500 font-medium border border-slate-200/60 max-w-md w-full text-left">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Anda dapat memantau status validasi berkas secara berkala melalui halaman <Link to="/applicant/status" className="font-bold text-sky-600 underline">Status Pelacakan Berkas</Link>.</span>
              </div>
            </div>

          ) : applicantButtonState(applicantData) === "REJECTED" ? (
            
            // KONDISI TAHAP REJECTED: Status Ditolak oleh Manager
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-12 shadow-[0_12px_40px_rgba(15,23,42,0.02)] flex flex-col items-center justify-center text-center space-y-5">
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl shadow-sm"><Lock className="w-6 h-6" /></div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">Seleksi Selesai</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                  Terima kasih atas perhatian dan partisipasi Anda dalam program rekrutmen ini. Berdasarkan hasil evaluasi dokumen kualifikasi berkas pendaftaran, mohon maaf profil Anda belum dapat kami lanjutkan ke tahap wawancara pada periode ini.
                </p>
              </div>
            </div>

          ) : applicantButtonState(applicantData) === "IN_TOPSIS_POOL" ? (
            
            // KONDISI KETIGA: Sudah di-review TA, masuk matriks keputusan, menunggu Approval HR Manager
            <div className="bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-12 shadow-[0_12px_40px_rgba(15,23,42,0.02)] flex flex-col items-center justify-center text-center space-y-5">
              <div className="p-4 bg-sky-50 border border-sky-100 text-sky-600 rounded-2xl shadow-sm"><CheckCircle2 className="w-6 h-6" /></div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">Tahap Sinkronisasi Nilai</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                  Verifikasi dokumen oleh tim Talent Acquisition telah selesai. Data kualifikasi Anda berhasil diteruskan ke panel HR Manager untuk tahap evaluasi dan penentuan jadwal wawancara resmi.
                </p>
              </div>
            </div>

          ) : (
            
            // KONDISI UTAMA APPROVED: JADWAL AKTIF
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* KARTU JADWAL WAWANCARA */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.02)] space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold font-display text-slate-950 uppercase tracking-wider flex items-center gap-2 mb-1">
                    <Video className="w-4 h-4 text-emerald-600" /> Undangan Sesi Wawancara Resmi
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Dokumen pendaftaran Anda telah disetujui. Silakan hadir tepat waktu pada sesi pertemuan virtual di bawah ini.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm"><Calendar className="w-5 h-5" /></div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Tanggal Pertemuan</span>
                      <span className="text-sm font-bold text-slate-800">{applicantData.interviewDetails?.date}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm"><Clock className="w-5 h-5" /></div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Waktu Pelaksanaan</span>
                      <span className="text-sm font-bold text-slate-800">{applicantData.interviewDetails?.time}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-200/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100"><Video className="w-5 h-5" /></div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Google Meet Room</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Harap gunakan akun email yang terdaftar saat memasuki ruang pertemuan virtual.</p>
                    </div>
                  </div>
                  <a 
                    href={applicantData.interviewDetails?.link || "https://meet.google.com"} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                  >
                    Masuk Sesi Wawancara
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* ── INJEKSI FITUR BARU: FORM PERMOHONAN RESCHEDULE (SINKRON & KONSISTEN) ── */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.02)] space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold font-display text-slate-950 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" /> Permohonan Perubahan Jadwal
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">Jika Anda memiliki kendala waktu yang mendesak, silakan ajukan permohonan perubahan jadwal dengan memberikan alasan logis di bawah ini.</p>
                </div>

                <form onSubmit={handleRequestReschedule} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Alasan Perubahan Jadwal Wawancara</label>
                    <textarea 
                      rows="3" 
                      required
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder="Contoh: Saya memohon penyesuaian jadwal wawancara karena terdapat bentrokan dengan jadwal ujian sidang tugas akhir di kampus pada jam yang sama." 
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-xs focus:outline-none focus:border-sky-500 resize-none font-sans leading-relaxed"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      disabled={submittingReschedule || !rescheduleReason.trim()}
                      className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-sky-600 disabled:bg-slate-300 text-white font-bold px-5 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submittingReschedule ? 'Mengirim...' : 'Kirim Permohonan'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function applicantButtonState(data) {
  if (data.status === 'Unverified') return "LOCKED_BY_TA";
  if (data.status === 'Verified' && data.interviewDetails?.status === 'Rejected') return "REJECTED";
  if (data.status === 'Verified' && data.interviewDetails?.status === 'Scheduled') return "ACCESSIBLE_SCHEDULE";
  if (data.status === 'Verified' && data.interviewDetails?.status === 'Locked') return "IN_TOPSIS_POOL";
  return "LOCKED_BY_TA";
}

export default InterviewSchedule;