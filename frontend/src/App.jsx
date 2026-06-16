import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Apply from './pages/Apply';
import ApplicantStatus from './pages/ApplicantStatus';
import TADashboard from './pages/TADashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CriteriaPage from './pages/CriteriaPage';
import ComputationPage from './pages/ComputationPage'; // PERBAIKAN: Sinkronisasi nama komponen dari typo "ComputatationPage"
import InterviewSchedule from './pages/InterviewSchedule';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#F5F7FB] text-slate-800 font-sans antialiased selection:bg-sky-100 selection:text-slate-900">
        <Routes>
          {/* Jalur Akses Publik & Tamu */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Jalur Akses Khusus Pelamar (Diproteksi) */}
          <Route path="/apply" element={<Apply />} />
          <Route path="/applicant/status" element={<ApplicantStatus />} />
          <Route path="/applicant/interview-schedule" element={<InterviewSchedule />} />

          {/* Jalur Akses Internal Perusahaan (Diproteksi) */}
          <Route path="/ta/dashboard" element={<TADashboard />} />
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          
          {/* SINKRONISASI RUTE: Jalur URL diselaraskan secara konstan dengan target tautan di komponen Sidebar */}
          <Route path="/manager/computation" element={<ComputationPage />} />
          <Route path="/manager/criteria" element={<CriteriaPage />} />

          {/* Alihan Rute Tidak Valid */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;