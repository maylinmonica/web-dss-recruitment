import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar'; 
import { 
  User, FileText, Link2, Send, Award, Trash2, X, Briefcase, UploadCloud,
  CheckCircle, AlertTriangle // PERBAIKAN: Impor ikon notifikasi agar konsisten dengan Login
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

function Apply() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Final Year');
  const [gpa, setGpa] = useState('');
  const [salary, setSalary] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  
  const [cvFile, setCvFile] = useState(null);
  const [transcriptFile, setTranscriptFile] = useState(null);

  const [certs, setCerts] = useState([]);
  const [awards, setAwards] = useState([]);
  
  const [techSkills, setTechSkills] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const navigate = useNavigate();

  const skillPresets = ["JavaScript", "TypeScript", "Python", "Go", "Java", "React.js", "Vue.js", "Node.js", "Laravel", "Docker", "SQL"];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (!token || role !== 'Applicant') {
      localStorage.clear();
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const addCertRow = () => setCerts([...certs, { id: Date.now(), name: '', issuer: '', description: '', file: null }]);
  const removeCertRow = (id) => setCerts(certs.filter(c => c.id !== id));
  const updateCertField = (id, field, value) => setCerts(certs.map(c => c.id === id ? { ...c, [field]: value } : c));

  const addAwardRow = () => setAwards([...awards, { id: Date.now(), title: '', eventName: '', description: '', file: null }]);
  const removeAwardRow = (id) => setAwards(awards.filter(a => a.id !== id));
  const updateAwardField = (id, field, value) => setAwards(awards.map(a => a.id === id ? { ...a, [field]: value } : a));

  const handleSelectSkill = (e) => {
    const value = e.target.value;
    if (value === "Lainnya") {
      setShowCustomInput(true);
    } else if (value && !techSkills.includes(value)) {
      setTechSkills([...techSkills, value]);
      setShowCustomInput(false);
    }
    e.target.value = ""; 
  };

  const handleAddCustomSkill = (e) => {
    if (e.key === 'Enter' && customSkill.trim()) {
      e.preventDefault();
      if (!techSkills.includes(customSkill.trim())) {
        setTechSkills([...techSkills, customSkill.trim()]);
      }
      setCustomSkill('');
      setShowCustomInput(false);
    }
  };

  const removeSkillBadge = (targetSkill) => {
    setTechSkills(techSkills.filter(s => s !== targetSkill));
  };

  const openFilePreview = (file) => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, '_blank');
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);

    const parsedSalary = parseInt(salary, 10);

    if (parsedSalary > 99999999) {
      setNotice({
        title: "Nominal Pengajuan Melebihi Batas",
        description: "Batas pengisian nominal uang saku bulanan maksimal adalah Rp99.999.999.",
        type: "warning"
      });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('name', name);
      formData.append('category', category);
      formData.append('c1_gpa', gpa);
      formData.append('c6_salary', salary);
      formData.append('portfolioUrl', portfolioUrl);
      
      if (cvFile) formData.append('cv', cvFile);
      if (transcriptFile) formData.append('transcript', transcriptFile);

      const validCerts = certs.filter(c => c.name.trim() !== '').map(c => ({
        name: c.name, issuer: c.issuer, description: c.description,
        fileName: c.file ? c.file.name : 'Sertifikat_Kompetensi.pdf'
      }));

      const validAwards = awards.filter(a => a.title.trim() !== '').map(a => ({
        title: a.title, eventName: a.eventName, description: a.description,
        fileName: a.file ? a.file.name : 'Piagam_Penghargaan.pdf'
      }));

      formData.append('certs', JSON.stringify(validCerts));
      formData.append('awards', JSON.stringify(validAwards));
      formData.append('skillsList', JSON.stringify(techSkills)); 

      const response = await axios.post(`${API_BASE_URL}/api/applicants/apply`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'Success') {
        setNotice(response.data.ui_notice || {
          title: "Pendaftaran Berhasil",
          description: "Seluruh berkas administrasi Anda sukses disimpan ke sistem pusat.",
          type: "success"
        });
        setName(''); setGpa(''); setSalary(''); setPortfolioUrl('');
        setCvFile(null); setTranscriptFile(null);
        setCerts([]); setAwards([]); setTechSkills([]);
      }
    } catch (error) {
      setNotice(error.response?.data?.ui_notice || {
        title: "Gagal Mengirimkan Formulir",
        description: "Terjadi gangguan koneksi menuju server database rekrutmen.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row text-slate-800 font-sans antialiased relative selection:bg-sky-100 selection:text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      <Sidebar />

      <div className="flex-1 flex flex-col relative overflow-y-auto">
        <main className="flex-1 p-6 sm:p-10 max-w-4xl w-full mx-auto space-y-8 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100 uppercase tracking-wide">Pendaftaran Magang</div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tracking-tight">Formulir Pengisian Berkas</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Mohon isi profil akademis, unggah berkas kelayakan, dan dokumen sertifikat pendukung Anda dengan benar.</p>
          </div>

          {/* PERBAIKAN: RENDER BANNER NOTIFIKASI DINAMIS (KONSISTEN DENGAN HALAMAN LOGIN) */}
          {notice && (
            <div className={`p-4 rounded-2xl flex items-start gap-3 border animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm ${
              notice.type === 'success' ? 'bg-emerald-50/60 border-emerald-100 text-emerald-900' :
              notice.type === 'warning' ? 'bg-amber-50/60 border-amber-100 text-amber-900' :
              'bg-rose-50/60 border-rose-100 text-rose-900'
            }`}>
              <div className="mt-0.5 shrink-0">
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

          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.02)]">
            <form onSubmit={handleApply} className="space-y-10">
              
              {/* SUB-SEKSI 1: PROFIL */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2"><User className="w-3.5 h-3.5" /> Profil Utama Pelamar</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Nama Lengkap Sesuai Identitas <span className="text-rose-500 text-xs">(Wajib)</span></label>
                    <input type="text" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:border-sky-500" placeholder="Contoh: Maylin Monica" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Status Pendidikan Saat Ini <span className="text-rose-500 text-xs">(Wajib)</span></label>
                    <select className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm font-medium focus:outline-none focus:border-sky-500" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Final Year">Mahasiswa Tingkat Akhir (Min. Semester 6)</option>
                      <option value="Fresh Graduate">Lulusan Baru (Maks. Kelulusan 1 Tahun)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SPESIFIKASI KEAHLIAN */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Fokus Penguasaan Teknologi &amp; Rumpun Keahlian</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Pilih Fokus Keahlian Utama</label>
                    <select onChange={handleSelectSkill} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm font-medium focus:outline-none focus:border-sky-500">
                      <option value="">-- Pilih Core Tech Stack --</option>
                      {skillPresets.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                      <option value="Lainnya">Keahlian Lainnya...</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    {showCustomInput && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Sebutkan Keahlian Khusus <span className="text-slate-400 font-normal lowercase">(Tekan Enter)</span></label>
                        <input type="text" value={customSkill} placeholder="Ketik keahlian lalu tekan Enter" onKeyDown={handleAddCustomSkill} onChange={(e) => setCustomSkill(e.target.value)} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-sky-500" />
                      </div>
                    )}
                  </div>
                </div>
                
                {techSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50/60 border border-slate-200/60 rounded-2xl animate-in fade-in duration-300">
                    {techSkills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm">
                        {skill}
                        <button type="button" onClick={() => removeSkillBadge(skill)} className="text-slate-400 hover:text-rose-500 rounded transition-colors"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* KUALIFIKASI ANGKA */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Capaian Akademis &amp; Ekspektasi Finansial</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Indeks Prestasi Kumulatif (IPK) Terakhir <span className="text-rose-500 text-xs">(Wajib)</span></label>
                    <input type="number" step="0.01" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-sky-500" placeholder="Contoh: 3.85" value={gpa} onChange={(e) => setGpa(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Ekspektasi Uang Saku Bulanan <span className="text-rose-500 text-xs">(Wajib)</span></label>
                    <input type="number" required className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm mb-0.5 focus:outline-none focus:border-sky-500" placeholder="Contoh: 3500000" value={salary} onChange={(e) => setSalary(e.target.value)} />
                    <span className="text-[10px] text-slate-400 leading-normal block">Batas maksimal nominal pengajuan adalah Rp99.999.999.</span>
                  </div>
                </div>
              </div>

              {/* DOKUMEN WAJIB */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Berkas Dokumen Wajib &amp; Portofolio</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Curriculum Vitae (CV) [Format PDF] <span className="text-rose-500 text-xs">(Wajib)</span></label>
                    {!cvFile ? (
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl cursor-pointer hover:bg-white hover:border-sky-500 transition-all group">
                        <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-sky-500 mb-0.5" />
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-sky-600">Pilih Berkas PDF CV</span>
                        <input type="file" accept=".pdf" required onChange={(e) => setCvFile(e.target.files[0])} className="hidden" />
                      </label>
                    ) : (
                      <div onClick={() => openFilePreview(cvFile)} className="flex items-center justify-between w-full h-20 p-4 border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-sky-500 rounded-2xl cursor-pointer transition-all duration-150 group animate-in fade-in">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2.5 bg-white border border-slate-200 text-emerald-600 rounded-xl shadow-sm"><FileText className="w-4 h-4" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-sky-600 group-hover:underline">{cvFile.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setCvFile(null); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-2 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Transkrip Nilai Akademik Terakhir [Format PDF] <span className="text-rose-500 text-xs">(Wajib)</span></label>
                    {!transcriptFile ? (
                      <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl cursor-pointer hover:bg-white hover:border-sky-500 transition-all group">
                        <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-sky-500 mb-0.5" />
                        <span className="text-xs font-semibold text-slate-500 group-hover:text-sky-600">Pilih Berkas PDF Transkrip</span>
                        <input type="file" accept=".pdf" required onChange={(e) => setTranscriptFile(e.target.files[0])} className="hidden" />
                      </label>
                    ) : (
                      <div onClick={() => openFilePreview(transcriptFile)} className="flex items-center justify-between w-full h-20 p-4 border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-sky-500 rounded-2xl cursor-pointer transition-all duration-150 group animate-in fade-in">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2.5 bg-white border border-slate-200 text-emerald-600 rounded-xl shadow-sm"><FileText className="w-4 h-4" /></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-sky-600 group-hover:underline">{transcriptFile.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{(transcriptFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setTranscriptFile(null); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-2 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>

                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Tautan Repositori Portofolio Digital (GitHub / GitLab) <span className="text-rose-500 text-xs">(Wajib)</span></label>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input type="url" required className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl text-sm focus:outline-none focus:border-sky-500" placeholder="Contoh: https://github.com/username" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* DOKUMEN OPSIONAL */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Sertifikasi &amp; Piagam Penghargaan <span className="text-slate-400 font-sans font-medium lowercase text-xs">(Opsional / Nilai Tambah)</span></h3>
                  <button type="button" onClick={addCertRow} className="text-[10px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg uppercase transition-colors">Tambah Sertifikat</button>
                </div>
                {certs.map((cert) => (
                  <div key={cert.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Sertifikat</label>
                        <input type="text" required value={cert.name} placeholder="Contoh: AWS Certified Cloud Practitioner" onChange={(e) => updateCertField(cert.id, 'name', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Institusi Penerbit</label>
                        <input type="text" required value={cert.issuer} placeholder="Contoh: Amazon Web Services" onChange={(e) => updateCertField(cert.id, 'issuer', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Kompetensi Utama</label>
                      <textarea rows="2" required value={cert.description} placeholder="Jelaskan secara ringkas materi teknis yang Anda kuasai dalam sertifikasi ini." onChange={(e) => updateCertField(cert.id, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none resize-none font-sans focus:border-sky-500" />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        {!cert.file ? (
                          <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:border-sky-500 rounded-xl cursor-pointer text-xs font-semibold text-slate-600 transition-all shadow-sm">
                            <UploadCloud className="w-4 h-4 text-slate-400" />
                            <span>Unggah Bukti Dokumen (PDF / JPG / PNG)</span>
                            <input type="file" accept=".pdf, .jpg, .jpeg, .png" required onChange={(e) => updateCertField(cert.id, 'file', e.target.files[0])} className="hidden" />
                          </label>
                        ) : (
                          <div onClick={() => openFilePreview(cert.file)} className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline cursor-pointer">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>{cert.file.name} (Pratinjau)</span>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => removeCertRow(cert.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PRESTASI */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Piagam Penghargaan &amp; Juara Kompetisi <span className="text-slate-400 font-sans font-medium lowercase text-xs">(Opsional / Nilai Tambah)</span></h3>
                  <button type="button" onClick={addAwardRow} className="text-[10px] font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg uppercase transition-colors">Tambah Piagam</button>
                </div>
                {awards.map((award) => (
                  <div key={award.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Gelar Penghargaan / Juara</label>
                        <input type="text" required value={award.title} placeholder="Contoh: Juara 2 Nasional Business Plan Competition" onChange={(e) => updateAwardField(award.id, 'title', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Ajang &amp; Institusi Penyelenggara</label>
                        <input type="text" required value={award.eventName} placeholder="Contoh: Ignite Future Fest UGM" onChange={(e) => updateAwardField(award.id, 'eventName', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Deskripsi Ringkas Ide / Karya Inovasi</label>
                      <textarea rows="2" required value={award.description} placeholder="Jelaskan secara ringkas mengenai konsep karya atau produk yang membawa Anda meraih penghargaan ini." onChange={(e) => updateAwardField(award.id, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none resize-none font-sans focus:border-sky-500" />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        {!award.file ? (
                          <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:border-sky-500 rounded-xl cursor-pointer text-xs font-semibold text-slate-600 transition-all shadow-sm">
                            <UploadCloud className="w-4 h-4 text-slate-400" />
                            <span>Unggah Bukti Piagam (PDF / JPG / PNG)</span>
                            <input type="file" accept=".pdf, .jpg, .jpeg, .png" required onChange={(e) => updateAwardField(award.id, 'file', e.target.files[0])} className="hidden" />
                          </label>
                        ) : (
                          <div onClick={() => openFilePreview(award.file)} className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline cursor-pointer">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span>{award.file.name} (Pratinjau)</span>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => removeAwardRow(award.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-slate-950 hover:bg-sky-600 text-white font-semibold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
                  <Send className="w-3.5 h-3.5" />
                  {loading ? 'Mengirim Data...' : 'Kirim Berkas Pendaftaran'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

    </div>
  );
}

export default Apply;