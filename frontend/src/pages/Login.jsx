import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, AlertTriangle, CheckCircle2, Cpu, ArrowRight, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const navigate = useNavigate();

  /**
   * Session Route Guard Engine: Verifies client storage persistence vectors.
   * Auto-routes authenticated tokens immediately to prevent login screen bypass vulnerabilities.
   */
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

  /**
   * Layout Notification Life-Cycle Tracker: Destroys notice alerts
   * automatically after the layout runtime threshold exceeds 5000ms.
   */
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  /**
   * Authentication Transaction Controller Pipeline: Requests credential validation 
   * from the system gateway and securely commits structural data assets.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      if (response.data.status === 'Success') {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userEmail', response.data.user.email);

        setNotice(response.data.ui_notice || {
          title: "Akses Diberikan",
          description: "Otentikasi berhasil. Mengalihkan menuju ruang kerja Anda...",
          type: "success"
        });

        /**
         * Intentional UI/UX Layout Latency Buffer: 1200ms Execution Delay.
         * Retains current workspace view context to ensure toast animation rendering completes
         * prior to the React Router virtual DOM dispatching the unmount sequence.
         */
        setTimeout(() => {
          const targetRole = response.data.user.role;
          if (targetRole === 'Applicant') navigate('/apply'); 
          else if (targetRole === 'Talent Acquisition') navigate('/ta/dashboard'); 
          else if (targetRole === 'HR Manager') navigate('/manager/dashboard'); 
        }, 1200);
      }
    } catch (error) {
      localStorage.clear();
      
      if (error.response?.data?.ui_notice) {
        setNotice(error.response.data.ui_notice);
      } else {
        setNotice({
          title: 'Koneksi Terhambat',
          description: 'Gagal mendapatkan respons dari sistem pusat. Silakan periksa status koneksi jaringan Anda.',
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row text-slate-800 font-sans antialiased relative selection:bg-sky-100 selection:text-slate-900 transform-gpu">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.04),_transparent_50%)] pointer-events-none" />

      <nav className="relative z-10 border-b border-slate-200/80 bg-[#F5F7FB]/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-slate-950 text-white p-1.5 rounded-md shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-md font-bold tracking-tight text-slate-950 font-display">
              CoreNexus Labs
            </span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.03)]">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold font-display text-slate-950 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">Silakan masuk kredensial akun Anda untuk mengakses dashboard dan memantau perkembangan program rekrutmen.</p>
          </div>

          {notice && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className={`p-4 rounded-2xl border bg-white/90 backdrop-blur-md shadow-lg flex items-start gap-3.5 relative overflow-hidden ${
                notice.type === 'success' ? 'border-emerald-100' : 'border-rose-100'
              }`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${notice.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <div className="shrink-0 pl-1">
                  {notice.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
                </div>
                <div className="flex-1 space-y-0.5 pr-4">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">{notice.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{notice.description}</p>
                </div>
                <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-600 absolute right-3 top-3"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Alamat Email Resmi
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:border-sky-500"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Kata Sandi Akun
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:border-sky-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-sky-600 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses Otentikasi...' : 'Masuk Sesi Kerja'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-500">
              Belum memiliki akun pelamar?{' '}
              <Link to="/register" className="text-sky-600 hover:text-sky-700 transition-colors">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-slate-200 text-[11px] text-slate-400 font-medium bg-[#F5F7FB]/30">
        <div className="max-w-6xl mx-auto px-6 py-5 text-center sm:text-left">
          &copy; 2026 CoreNexus Labs. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}

export default Login;