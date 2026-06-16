import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Cpu, FileText, ClipboardList, LogOut, Menu, X, 
  Users, BarChart3, Sliders, Video, Calculator 
} from 'lucide-react';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const userEmail = localStorage.getItem('userEmail') || 'user@mail.com';
  const userRole = localStorage.getItem('userRole') || 'Applicant'; 

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* HEADER MOBILE CONTROLLER */}
      <header className="w-full bg-slate-950 text-white px-6 py-4 flex items-center justify-between md:hidden shrink-0 border-b border-slate-900 z-30">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight font-display">CoreNexus Labs</span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div 
          onClick={toggleSidebar} 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* PRIMARY SIDEBAR FIXED PANEL */}
      <aside className={`
        fixed top-0 bottom-0 left-0 w-64 bg-slate-950 text-slate-400 flex flex-col justify-between shrink-0 border-r border-slate-900 z-50 transition-transform duration-300 md:translate-x-0 md:static
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* BRAND LOGO BAR */}
          <div className="px-6 py-6 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-blue-600 text-white p-1.5 rounded-md shadow-sm">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white font-display">
                CoreNexus Labs
              </span>
            </div>
            <button onClick={toggleSidebar} className="p-1 hover:bg-slate-900 rounded-lg md:hidden text-slate-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* INSTANCE CONTEXT SCOPE */}
          <div className="px-6 py-5 border-b border-slate-900 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {userRole === 'Applicant' ? 'Akun Pelamar' : `Panel ${userRole}`}
            </span>
            <div className="text-xs font-medium text-slate-200 truncate">{userEmail}</div>
          </div>

          {/* ROLE-BASED DYNAMIC PRIVILEGES NAVIGATION */}
          <nav className="p-4 space-y-1">
            
            {/* GRUP MENU: ROLE APPLICANT */}
            {userRole === 'Applicant' && (
              <>
                <Link 
                  to="/apply" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-150 ${
                    isActive('/apply') ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-900/60 hover:text-slate-200 font-medium'
                  }`}
                >
                  <FileText className={`w-4 h-4 ${isActive('/apply') ? 'text-sky-500' : 'text-slate-500'}`} />
                  Isi Formulir Berkas
                </Link>
                <Link 
                  to="/applicant/status" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-150 ${
                    isActive('/applicant/status') ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-900/60 hover:text-slate-200 font-medium'
                  }`}
                >
                  <ClipboardList className={`w-4 h-4 ${isActive('/applicant/status') ? 'text-sky-500' : 'text-slate-500'}`} />
                  Status Pelacakan
                </Link>
                <Link 
                  to="/applicant/interview-schedule" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-150 ${
                    isActive('/applicant/interview-schedule') ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-900/60 hover:text-slate-200 font-medium'
                  }`}
                >
                  <Video className={`w-4 h-4 ${isActive('/applicant/interview-schedule') ? 'text-sky-500' : 'text-slate-500'}`} />
                  Jadwal Wawancara
                </Link>
              </>
            )}

            {/* GRUP MENU: ROLE TALENT ACQUISITION */}
            {userRole === 'Talent Acquisition' && (
              <>
                <Link 
                  to="/ta/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-150 ${
                    isActive('/ta/dashboard') ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-900/60 hover:text-slate-200 font-medium'
                  }`}
                >
                  <Users className={`w-4 h-4 ${isActive('/ta/dashboard') ? 'text-sky-500' : 'text-slate-500'}`} />
                  Validasi Dokumen
                </Link>
              </>
            )}

            {/* GRUP MENU: ROLE HR MANAGER (PERBAIKAN TOTAL ALAMAT PATH LINK) */}
            {userRole === 'HR Manager' && (
              <>
                <Link 
                  to="/manager/dashboard" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-150 ${
                    isActive('/manager/dashboard') ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-900/60 hover:text-slate-200 font-medium'
                  }`}
                >
                  <BarChart3 className={`w-4 h-4 ${isActive('/manager/dashboard') ? 'text-sky-500' : 'text-slate-500'}`} />
                  Peringkat Rekomendasi
                </Link>
                <Link 
                  to="/manager/criteria" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-150 ${
                    isActive('/manager/criteria') ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-900/60 hover:text-slate-200 font-medium'
                  }`}
                >
                  <Sliders className={`w-4 h-4 ${isActive('/manager/criteria') ? 'text-sky-500' : 'text-slate-500'}`} />
                  Pengaturan Bobot
                </Link>
                <Link 
                  to="/manager/computation" 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs tracking-wide transition-all duration-150 ${
                    isActive('/manager/computation') ? 'bg-slate-900 text-white font-semibold' : 'hover:bg-slate-900/60 hover:text-slate-200 font-medium'
                  }`}
                >
                  <Calculator className={`w-4 h-4 ${isActive('/manager/computation') ? 'text-sky-500' : 'text-slate-500'}`} />
                  Transparansi Komputasi
                </Link>
              </>
            )}

          </nav>
        </div>

        <div className="p-4 border-t border-slate-900">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-rose-950/30 text-rose-400 hover:text-rose-500 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 uppercase"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sesi
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;