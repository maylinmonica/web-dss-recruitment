import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar'; 
import { 
  Cpu, FileText, Clock, AlertTriangle, Award, Terminal,
  User, FileCheck, ExternalLink, CheckCircle2, XCircle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function ApplicantStatus() {
  const [applicantData, setApplicantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');

    if (!token || role !== 'Applicant') {
      localStorage.clear();
      navigate('/login');
      return;
    }

    setUserEmail(email || '');

    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/applicants/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.status === 'Success') {
          setApplicantData(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Gagal memuat data status pelamar:", error.response?.data || error.message);
        setLoading(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  const formatRupiah = (number) => {
    if (!number) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const getNextStepState = () => {
    if (!applicantData || applicantData.status !== 'Verified') {
      return {
        bg: 'bg-slate-50 border-slate-200/60 text-slate-400',
        icon: <Clock className="w-5 h-5" />,
        title: 'Tahap Selanjutnya',
        desc: 'Menunggu proses verifikasi dokumen oleh tim seleksi.',
        opacity: 'opacity-40'
      };
    }
    
    const interviewStatus = applicantData.interviewDetails?.status;
    if (interviewStatus === 'Scheduled') {
      return {
        bg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
        icon: <CheckCircle2 className="w-5 h-5" />,
        title: 'Undangan Wawancara',
        desc: 'Dokumen Anda disetujui. Silakan periksa jadwal wawancara Anda.',
        opacity: ''
      };
    } else if (interviewStatus === 'Rejected') {
      return {
        bg: 'bg-rose-50 border-rose-100 text-rose-600',
        icon: <XCircle className="w-5 h-5" />,
        title: 'Seleksi Selesai',
        desc: 'Kualifikasi dokumen Anda belum sesuai dengan kebutuhan program saat ini.',
        opacity: ''
      };
    } else {
      return {
        bg: 'bg-sky-50 border-sky-100 text-sky-600 animate-pulse',
        icon: <Clock className="w-5 h-5" />,
        title: 'Proses Evaluasi',
        desc: 'Verifikasi dokumen selesai. Menunggu validasi jadwal dari HR Manager.',
        opacity: ''
      };
    }
  };

  const nextStep = getNextStepState();

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row text-slate-800 font-sans antialiased selection:bg-sky-100 selection:text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <Sidebar />

      <div className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.04),_transparent_50%)] pointer-events-none" />

        <main className="flex-1 p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-8 relative z-10">
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 tracking-wide uppercase">
              Pelacakan Aplikasi
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tracking-tight">Status Pelacakan Berkas</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Pantau kemajuan proses verifikasi kualifikasi dokumen administrasi Anda secara berkala.</p>
          </div>

          {/* LINI MASA TIMELINE */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.02)] space-y-8">
            {loading ? (
              <div className="py-12 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
                Memuat Status Dokumen...
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative">
                  
                  {/* TAHAP 1: CREATE YOUR PROFILE */}
                  <div className="flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">Akun Dibuat</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Registrasi akun pendaftaran Anda telah berhasil dilakukan.</p>
                    </div>
                  </div>

                  {/* TAHAP 2: SUBMIT YOUR APPLICATION */}
                  <div className={`flex items-start gap-3.5 ${!applicantData ? 'opacity-50' : ''}`}>
                    <div className={`p-2 rounded-xl shrink-0 shadow-sm border ${
                      applicantData ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-sky-50 border-sky-100 text-sky-600 animate-pulse'
                    }`}>
                      {applicantData ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">Formulir Dikirim</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {applicantData ? 'Dokumen administrasi dan portofolio Anda telah sukses diterima sistem.' : 'Menunggu pengisian data kualifikasi pada formulir pendaftaran.'}
                      </p>
                    </div>
                  </div>

                  {/* TAHAP 3: APPLICATION REVIEW */}
                  <div className={`flex items-start gap-3.5 ${applicantData?.status !== 'Verified' && !applicantData ? 'opacity-40' : ''}`}>
                    <div className={`p-2 rounded-xl shrink-0 shadow-sm border ${
                      applicantData?.status === 'Verified' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : applicantData ? 'bg-sky-50 border-sky-100 text-sky-600 animate-pulse' : 'bg-slate-50 border-slate-200/60 text-slate-400'
                    }`}>
                      {applicantData?.status === 'Verified' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">Validasi Dokumen</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {!applicantData ? 'Menunggu pengiriman berkas lamaran.' : applicantData.status === 'Verified' ? 'Tim Talent Acquisition telah selesai memverifikasi berkas pendaftaran.' : 'Berkas Anda berada dalam antrean peninjauan oleh tim terkait.'}
                      </p>
                    </div>
                  </div>

                  {/* TAHAP 4: NEXT STEP */}
                  <div className={`flex items-start gap-3.5 ${nextStep.opacity}`}>
                    <div className={`p-2 rounded-xl shrink-0 shadow-sm border ${nextStep.bg}`}>
                      {nextStep.icon}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">{nextStep.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{nextStep.desc}</p>
                    </div>
                  </div>

                </div>

                {/* NOTIFIKASI DINAMIS */}
                {!applicantData ? (
                  <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex gap-3.5 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 leading-relaxed">
                      <span className="font-bold">Tindakan Diperlukan:</span> Anda belum melengkapi berkas aplikasi. Silakan menuju menu <Link to="/apply" className="font-semibold underline text-sky-600 hover:text-sky-700">Isi Formulir</Link> untuk mengirim data kualifikasi Anda.
                    </p>
                  </div>
                ) : applicantData.interviewDetails?.status === 'Scheduled' ? (
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex gap-3.5 items-start text-emerald-950 animate-in zoom-in-95 duration-200">
                    <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      <span className="font-bold text-emerald-900">Hasil Seleksi Dokumen:</span> Berkas lamaran Anda telah <span className="font-bold">Lolos Verifikasi</span>. Jadwal wawancara resmi Anda telah diterbitkan. Silakan akses menu <Link to="/applicant/interview-schedule" className="font-bold underline text-sky-600 hover:text-sky-700">Sesi Wawancara</Link> untuk melihat detail informasi pertemuan virtual.
                    </p>
                  </div>
                ) : applicantData.interviewDetails?.status === 'Rejected' ? (
                  <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 flex gap-3.5 items-start text-rose-950 animate-in zoom-in-95 duration-200">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">
                      <span className="font-bold text-rose-900">Informasi Hasil Seleksi:</span> Terima kasih telah mendaftar di CoreNexus Labs. Berdasarkan hasil evaluasi dokumen, kualifikasi Anda belum sesuai dengan kriteria yang dibutuhkan pada periode ini. Profil Anda akan tetap tersimpan dalam basis data kami untuk peluang program di masa mendatang.
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex gap-3.5 items-start">
                    <Award className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      <span className="font-bold text-slate-700">Status Lamaran Aktif:</span> Dokumen atas nama <span className="font-semibold text-slate-800">{applicantData.name}</span> untuk posisi <span className="font-semibold text-slate-800">{applicantData.category === 'Final Year' ? 'Mahasiswa Tingkat Akhir' : 'Lulusan Baru'}</span> telah terdaftar dan siap diproses ke tahap perangkingan evaluasi.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RINGKASAN DATA FORMULIR */}
          {!loading && applicantData && (
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.02)] space-y-6 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold font-display text-slate-950 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-sky-500" /> Ringkasan Dokumen Terkirim
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Berikut adalah salinan riwayat parameter kualifikasi administrasi Anda yang tercatat di sistem backend.</p>
              </div>

              {/* DATA PROFILE GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Nama Lengkap Pelamar</span>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">{applicantData.name}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Kategori Kelompok Lowongan</span>
                    <div className="text-sm font-medium text-slate-700 mt-0.5">
                      {applicantData.category === 'Final Year' ? 'Mahasiswa Tingkat Akhir (Semester Akhir)' : 'Lulusan Baru (Fresh Graduate)'}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Indeks Prestasi Kumulatif (IPK)</span>
                    <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">{applicantData.c1_gpa?.toFixed(2)} / 4.00</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Ekspektasi Uang Saku Bulanan</span>
                    <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">{formatRupiah(applicantData.c6_salary)}</div>
                  </div>
                </div>
              </div>

              {/* TECH SKILLS LIST BADGES */}
              {applicantData.skillsList && applicantData.skillsList.length > 0 && (
                <div className="border-b border-slate-100 pb-6 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Fokus Penguasaan Teknologi &amp; Rumpun Keahlian</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {applicantData.skillsList.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* BERKAS DOKUMEN INTI UTAMA */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Dokumen Wajib &amp; Portofolio (Klik untuk Meninjau)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <a href={applicantData.portfolioUrl || 'https://github.com'} target="_blank" rel="noreferrer" className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-sky-300 flex items-center justify-between group transition-all duration-150">
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Tautan Portofolio</div>
                      <div className="text-xs font-semibold text-sky-600 truncate mt-0.5">{applicantData.portfolioUrl ? 'Buka Repositori' : 'Belum Melampirkan'}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </a>

                  <a href={`${API_BASE_URL}/uploads/${applicantData.cvName || 'Curriculum_Vitae.pdf'}`} target="_blank" rel="noreferrer" className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-sky-300 flex items-center justify-between group transition-all duration-150">
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Curriculum Vitae (CV)</div>
                      <div className="text-xs font-bold text-slate-700 truncate mt-0.5 group-hover:text-sky-600 group-hover:underline transition-all">{applicantData.cvName || 'Curriculum_Vitae.pdf'}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </a>

                  <a href={`${API_BASE_URL}/uploads/${applicantData.transcriptName || 'Transkrip_Nilai_Terakhir.pdf'}`} target="_blank" rel="noreferrer" className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-sky-300 flex items-center justify-between group transition-all duration-150">
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Transkrip Nilai</div>
                      <div className="text-xs font-bold text-slate-700 truncate mt-0.5 group-hover:text-sky-600 group-hover:underline transition-all">{applicantData.transcriptName || 'Transkrip_Nilai_Terakhir.pdf'}</div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors" />
                  </a>
                </div>
              </div>

              {/* SERTIFIKAT */}
              {applicantData.certs && applicantData.certs.length > 0 && applicantData.certs[0].name !== '' && (
                <div className="pt-2 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest block uppercase">Sertifikasi Kompetensi Tambahan</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {applicantData.certs.map((c, idx) => (
                      <a 
                        key={idx} 
                        href={`${API_BASE_URL}/uploads/${c.fileName || 'Sertifikat_Kompetensi.pdf'}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/20 hover:bg-white hover:border-sky-300 flex flex-col justify-between group transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        <div className="flex justify-between items-start w-full gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-sky-600 group-hover:underline transition-all">{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Penerbit: {c.issuer}</div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 transition-colors shrink-0 mt-0.5" />
                        </div>
                        {c.description && (
                          <p className="text-[11px] text-slate-500 mt-2.5 border-t border-slate-100 pt-2 leading-relaxed bg-slate-50/40 p-2 rounded-xl group-hover:bg-slate-50 group-hover:text-slate-600 transition-all">
                            {c.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* PRESTASI */}
              {applicantData.awards && applicantData.awards.length > 0 && applicantData.awards[0].title !== '' && (
                <div className="pt-2 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest block uppercase">Dokumen Prestasi / Piagam Tambahan</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {applicantData.awards.map((a, idx) => (
                      <a 
                        key={idx} 
                        href={`${API_BASE_URL}/uploads/${a.fileName || 'Piagam_Penghargaan.pdf'}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/20 hover:bg-white hover:border-sky-300 flex flex-col justify-between group transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        <div className="flex justify-between items-start w-full gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 group-hover:text-sky-600 group-hover:underline transition-all">{a.title}</div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Event: {a.eventName}</div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 transition-colors shrink-0 mt-0.5" />
                        </div>
                        {a.description && (
                          <p className="text-[11px] text-slate-500 mt-2.5 border-t border-slate-100 pt-2 leading-relaxed bg-slate-50/40 p-2 rounded-xl group-hover:bg-slate-50 group-hover:text-slate-600 transition-all">
                            {a.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ApplicantStatus;