import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, CheckCircle2, AlertTriangle, Cpu, ArrowRight, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const navigate = useNavigate();

  /**
   * Session route guard validation logic.
   * Redirects authenticated assets directly to their designated routing scopes.
   */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (token && role) {
      if (role === 'Applicant') navigate('/apply');
      else if (role === 'Talent Acquisition') navigate('/ta/dashboard');
      else if (role === 'HR Manager') navigate('/manager/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  /**
   * Account registration request controller pipeline.
   * Validates parameter structural criteria before transmission to the system endpoint.
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    if (password.length < 8) {
      setNotice({
        title: "Kata Sandi Terlalu Pendek",
        description: "Kata sandi wajib memiliki minimal 8 karakter.",
        type: "warning"
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setNotice({
        title: "Konfirmasi Sandi Gagal",
        description: "Kata sandi baru dan konfirmasi kata sandi Anda tidak cocok. Silakan ketik ulang.",
        type: "warning"
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { email, password });

      if (response.data.status === 'Success' || response.status === 201) {
        setNotice(response.data.ui_notice || {
          title: "Registrasi Berhasil",
          description: "Akun Anda sukses diaktifkan. Mengalihkan ke halaman login...",
          type: "success"
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.ui_notice) {
        setNotice(error.response.data.ui_notice);
      } else {
        setNotice({
          title: "Pendaftaran Gagal",
          description: "Gagal terhubung ke sistem registrasi. Periksa kembali status koneksi jaringan Anda.",
          type: "error"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col text-slate-800 font-sans antialiased relative overflow-hidden selection:bg-sky-100 selection:text-slate-900 transform-gpu">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.03),_transparent_30%)] pointer-events-none" />

      <nav className="relative z-10 border-b border-slate-200/80 bg-[#F5F7FB]/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-slate-950 text-white p-1.5 rounded-md group-hover:bg-sky-600 transition-colors duration-300 shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-md font-bold tracking-tight text-slate-950 font-display">CoreNexus Labs</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.03)]">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold font-display text-slate-950 tracking-tight">Registrasi Akun Baru</h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Daftarkan alamat email resmi Anda untuk mulai melakukan pengisian berkas kualifikasi pendaftaran program.</p>
          </div>

          {/* SINKRONISASI: Standardisasi Layout Banner Notifikasi Toast yang Konsisten */}
          {notice && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className={`p-4 rounded-2xl border bg-white/90 backdrop-blur-md shadow-lg flex items-start gap-3.5 relative overflow-hidden ${
                notice.type === 'success' ? 'border-emerald-100' : notice.type === 'warning' ? 'border-amber-100' : 'border-rose-100'
              }`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  notice.type === 'success' ? 'bg-emerald-500' : notice.type === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <div className="shrink-0 pl-1">
                  {notice.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {notice.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {notice.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                </div>
                <div className="flex-1 space-y-0.5 pr-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">{notice.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{notice.description}</p>
                </div>
                <button type="button" onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 absolute right-3 top-3"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Alamat Email Resmi</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition-all duration-150"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <span className="text-[10px] text-slate-400 leading-normal block mt-1">Gunakan alamat email aktif untuk kebutuhan pengiriman surat konfirmasi status berkas berkala.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kata Sandi Baru</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition-all duration-150"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <span className="text-[10px] text-slate-400 leading-normal block mt-1">Sandi wajib dikonfigurasi menggunakan kombinasi karakter alfanumerik minimal sepanjang 8 digit.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition-all duration-150"
                  placeholder="Ketik ulang kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
              <span className="text-[10px] text-slate-400 leading-normal block mt-1">Ketik kembali susunan kata sandi baru secara identik untuk memvalidasi akurasi otentikasi.</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-sky-600 disabled:bg-slate-400 text-white font-semibold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses Pendaftaran...' : 'Mendaftar Akun Baru'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">
              Sudah memiliki akun sebelumnya?{' '}
              <Link to="/login" className="text-sky-600 hover:text-sky-700 font-semibold transition-colors">Masuk di sini</Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-slate-200 text-[11px] text-slate-400 font-medium bg-[#F5F7FB]/30">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center sm:text-left">&copy; 2026 CoreNexus Labs. All Rights Reserved.</div>
      </footer>
    </div>
  );
}

export default Register;