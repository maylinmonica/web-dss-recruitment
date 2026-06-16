import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, CheckCircle, AlertTriangle, Cpu, ArrowRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const navigate = useNavigate();

  // ROUTE GUARD: Memastikan rute publik bersih dari sisa token kedaluwarsa
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (token && role) {
      if (role === 'Applicant') {
        navigate('/apply');
      } else if (role === 'Talent Acquisition') {
        navigate('/ta/dashboard');
      } else if (role === 'HR Manager') {
        navigate('/manager/dashboard');
      }
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

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
      const response = await axios.post('${API_BASE_URL}/api/auth/register', {
        email,
        password
      });

      if (response.data.status === 'Success' || response.status === 201) {
        setNotice(response.data.ui_notice || {
          title: "Registrasi Berhasil",
          description: "Akun Anda sukses diaktifkan. Mengalihkan ke halaman login...",
          type: "success"
        });
        
        // Memberikan jeda waktu agar pengguna dapat membaca pesan sukses dengan nyaman
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
          description: "Gagal terhubung ke sistem registrasi. Periksa kembali status jaringan backend Anda.",
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

      {/* Ambient Premium Radial Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.03),_transparent_30%)] pointer-events-none" />

      {/* NAVIGATION HEADER BAR */}
      <nav className="relative z-10 border-b border-slate-200/80 bg-[#F5F7FB]/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-slate-950 text-white p-1.5 rounded-md group-hover:bg-sky-600 transition-colors duration-300 shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-md font-bold tracking-tight text-slate-950 font-display">
              CoreNexus Labs
            </span>
          </Link>
        </div>
      </nav>

      {/* FORM CONTAINER MIDDLE ALIGNMENT */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.03)]">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold font-display text-slate-950 tracking-tight">
              Create an account
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Daftarkan email aktif Anda untuk mulai mengisi data kualifikasi lamaran fellowship program.
            </p>
          </div>

          {/* DYNAMIC RESPONSIVE ALERT NOTICE */}
          {notice && (
            <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border animate-in fade-in slide-in-from-top-2 duration-200 ${
              notice.type === 'success' ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900' :
              notice.type === 'warning' ? 'bg-amber-50/60 border-amber-100 text-amber-900' :
              'bg-rose-50/60 border-rose-100 text-rose-900'
            }`}>
              <div className="mt-0.5 flex-shrink-0">
                {notice.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                {notice.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {notice.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs uppercase tracking-wide">{notice.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{notice.description}</p>
              </div>
            </div>
          )}

          {/* FORM ACCOUNT REGISTRATION */}
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition-all duration-150"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm transition-all duration-150"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Confirm Password
              </label>
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
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-sky-600 disabled:bg-slate-400 text-white font-semibold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* REDIRECT SUB-LINK */}
          <div className="mt-8 text-center border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">
              Sudah memiliki akun sebelumnya?{' '}
              <Link to="/login" className="text-sky-600 hover:text-sky-700 font-semibold transition-colors">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER NOTATION */}
      <footer className="relative z-10 border-t border-slate-200 text-[11px] text-slate-400 font-medium bg-[#F5F7FB]/30">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center sm:text-left">
          &copy; 2026 CoreNexus Labs. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

export default Register;