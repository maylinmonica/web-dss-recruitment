import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { Save, CheckCircle2, AlertTriangle, X, Sliders, Info } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const CRITERIA_LABELS = {
  c1: 'Indeks Prestasi Kumulatif (IPK)',
  c2: 'Kualitas Portofolio Teknis',
  c3: 'Pengalaman Organisasi / Proyek',
  c4: 'Nilai Tambah Dokumen Pendukung',
  c5: 'Kesesuaian Spesifikasi Keahlian',
  c6: 'Ekspektasi Uang Saku / Gaji'
};

function CriteriaPage() {
  const [criteria, setCriteria] = useState(null);
  const [editWeights, setEditWeights] = useState({});
  const [editAttributes, setEditAttributes] = useState({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [notice, setNotice] = useState(null);
  const token = localStorage.getItem('token');

  const fetchCriteria = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/criteria`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'Success') {
        setCriteria(res.data.data);
        const w = {};
        Object.entries(res.data.data.weights).forEach(([k, v]) => {
          w[k] = (parseFloat(v) * 100).toString();
        });
        setEditWeights(w);
        setEditAttributes({ ...res.data.data.attributes });
      }
    } catch (err) {
      setNotice({ 
        title: 'Gagal Memuat Kriteria', 
        description: 'Data konfigurasi kriteria penilaian tidak dapat diunduh dari server.', 
        type: 'error' 
      });
    }
  };

  useEffect(() => { 
    fetchCriteria(); 
  }, []);

  const totalPercent = Object.values(editWeights).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);

  const handleSaveCriteria = async () => {
    setSavingConfig(true);
    try {
      const weights = {};
      Object.entries(editWeights).forEach(([k, v]) => {
        weights[k] = (parseFloat(v) || 0) / 100;
      });

      const res = await axios.put(
        `${API_BASE_URL}/api/criteria/update`,
        { weights, attributes: editAttributes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status === 'Success') {
        setNotice(res.data.ui_notice);
        setCriteria(res.data.data);
      }
    } catch (err) {
      setNotice({ 
        title: 'Gagal Menyimpan', 
        description: 'Terjadi kesalahan sistem saat mencoba memperbarui bobot kriteria.', 
        type: 'error' 
      });
    } finally {
      setSavingConfig(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row text-slate-800 font-sans antialiased relative selection:bg-sky-100 selection:text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Sistem Notifikasi Toast */}
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

        <main className="main-workspace-container flex-1 p-6 sm:p-10 space-y-8 z-10 animate-in fade-in duration-150">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100 uppercase tracking-wide">Pengaturan Kriteria</div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tracking-tight">Konfigurasi Bobot Kriteria</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Menentukan persentase bobot kepentingan kriteria. Total alokasi seluruh kriteria wajib berjumlah 100%.</p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_12px_40px_rgba(15,23,42,0.02)] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2"><Sliders className="w-4 h-4 text-slate-400" /> Parameter Matriks Perangkingan</h3>
              <span className={`px-3 py-1 text-xs font-mono font-bold rounded-xl border ${Math.abs(totalPercent - 100) < 0.01 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>Total Input: {totalPercent.toFixed(0)}% / 100%</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {Object.keys(CRITERIA_LABELS).map((key) => (
                <div key={key} className="p-4 bg-slate-50/60 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    {/* PERBAIKAN: Kode teknis mentah C1, C2, dll. sudah dihilangkan sepenuhnya */}
                    <h4 className="text-sm font-semibold text-slate-900">{CRITERIA_LABELS[key]}</h4>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" max="100" value={editWeights[key] ?? ''} onChange={(e) => setEditWeights(w => ({ ...w, [key]: e.target.value }))} className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500" placeholder="0" />
                      <span className="text-xs text-slate-400 font-semibold">%</span>
                    </div>
                    <select value={editAttributes[key] ?? 'benefit'} onChange={(e) => setEditAttributes(a => ({ ...a, [key]: e.target.value }))} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500">
                      <option value="benefit">Benefit (Kualifikasi tinggi menguntungkan)</option>
                      <option value="cost">Cost (Kompensasi rendah menguntungkan)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 bg-white">
              <div className="flex items-center gap-2 text-slate-400 text-xs"><Info className="w-4 h-4 text-slate-400 shrink-0" /><span>Tombol simpan akan aktif jika alokasi nilai seluruh kriteria tepat bernilai 100%.</span></div>
              {/* PERBAIKAN: Tombol simpan diubah dari Hitam Pekat menjadi Biru Brand Premium */}
              <button onClick={handleSaveCriteria} disabled={savingConfig || Math.abs(totalPercent - 100) > 0.01} className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-full text-xs font-bold uppercase tracking-wide transition-all shadow-sm">{savingConfig ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CriteriaPage;