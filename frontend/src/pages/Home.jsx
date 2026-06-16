import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, ArrowRight, ArrowUpRight, Lock } from 'lucide-react';

const ENGINEERING_TRACKS = [
  {
    num: '01',
    title: 'Web Platforms',
    desc: 'Membangun antarmuka web yang cepat, rapi, dan siap mendukung produk digital yang dipakai banyak orang.'
  },
  {
    num: '02',
    title: 'Mobile Experience',
    desc: 'Menciptakan pengalaman mobile yang responsif, smooth, dan konsisten di berbagai perangkat.'
  },
  {
    num: '03',
    title: 'Cloud Systems',
    desc: 'Menyusun fondasi sistem yang stabil, aman, dan siap berkembang seiring skala produk.'
  }
];

const SELECTION_STEPS = [
  {
    step: '01',
    title: 'Akun Dibuat',
    desc: 'Buat akun dan mulai lihat detail program internship yang sedang dibuka.'
  },
  {
    step: '02',
    title: 'Formulir Dikirim',
    desc: 'Lengkapi data dasar, unggah CV, transkrip, dan tambahkan portofolio digital.'
  },
  {
    step: '03',
    title: 'Validasi Dokumen',
    desc: 'Tim akan meninjau profil, kelengkapan, dan kesesuaian dengan kebutuhan program.'
  },
  {
    step: '04',
    title: 'Tahap Selanjutnya',
    desc: 'Kandidat yang lolos akan diarahkan ke proses berikutnya sebelum onboarding.'
  }
];

const PROGRAM_FIT = [
  {
    title: 'Terbuka untuk Mahasiswa Tingkat Akhir dan Lulusan Baru',
    desc: 'Program ini dibuka untuk mahasiswa tingkat akhir dan lulusan baru yang siap masuk ke lingkungan kerja nyata.'
  },
  {
    title: 'Dirancang untuk Profil Bidang Teknologi',
    desc: 'Cocok untuk latar belakang di software engineering, informatika, sistem informasi, dan bidang teknologi lain yang relevan.'
  },
  {
    title: 'Tidak Diwajibkan Pengalaman Kerja Industri',
    desc: 'Yang utama adalah potensi, rasa ingin belajar, dan kesiapan untuk berkembang lewat proyek nyata.'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F5F7FB] flex flex-col text-slate-800 antialiased selection:bg-sky-100 selection:text-slate-900">
      
      <nav className="sticky top-0 z-50 bg-[#F5F7FB]/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-slate-950 text-white p-1.5 rounded-md group-hover:bg-sky-600 transition-colors duration-300 shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-md font-bold tracking-tight text-slate-950 font-display">
              CoreNexus Labs
            </span>
          </Link>

          <Link
            to="/register"
            className="group flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-900 uppercase tracking-widest"
          >
            Apply Now
            <span className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center group-hover:bg-slate-950 group-hover:border-slate-950 group-hover:text-white transition-all duration-300">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.10),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.04),_transparent_28%)]" />
          <div className="relative max-w-7xl mx-auto px-6 min-h-[calc(100vh-76px)] flex items-center py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
              <div className="space-y-7 lg:col-span-7 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600 shadow-sm">
                  Open Internship 2026
                </div>

                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-slate-950 leading-[0.96] tracking-tight max-w-2xl">
                  Build products that feel
                  <br />
                  <span className="text-sky-600">clean, fast, and modern.</span>
                </h1>

                <p className="text-slate-500 text-sm sm:text-[15px] leading-relaxed max-w-xl">
                  CoreNexus Labs membuka kesempatan untuk kamu yang ingin terlibat langsung dalam pengembangan produk digital,
                  dari interface yang polished sampai sistem yang siap tumbuh bersama skala perusahaan.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-sky-600 text-white font-semibold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-sm w-full sm:w-auto"
                  >
                    Start Your Application
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
                    Software house internship opening
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative justify-self-center lg:justify-self-end w-full max-w-[560px]">
                <div className="absolute -top-4 -right-4 w-full h-full border-2 border-slate-950 rounded-3xl hidden lg:block" />
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
                    alt="CoreNexus Labs team working together"
                    className="w-full h-full object-cover select-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-slate-950 py-3 overflow-hidden border-y border-slate-900">
          <div className="flex whitespace-nowrap animate-marquee">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-8 pr-8">
                {Array(6).fill(0).map((_, j) => (
                  <span
                    key={j}
                    className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 flex items-center gap-8"
                  >
                    Now Hiring
                    <span className="text-sky-400 font-display text-sm">
                      Junior Web Developer Internship
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="py-16 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Company at a glance
            </span>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { value: '120+', label: 'Projects Delivered' },
                { value: '15M+', label: 'Users Served' },
                { value: '99.9%', label: 'System Uptime' },
                { value: 'A+', label: 'Code Standard' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm p-6 shadow-sm"
                >
                  <div className="font-display text-4xl lg:text-5xl text-slate-950">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-24 border-b border-slate-200 bg-white/30">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-4 space-y-3 lg:self-start">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
                Program fit
              </span>
              <h2 className="font-display text-3xl text-slate-950 leading-tight">
                Built for profiles like this
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Fokusnya bukan tampil formal berlebihan, tapi masuk ke environment kerja yang modern, cepat, dan kolaboratif.
              </p>
            </div>

            <div className="lg:col-span-8">
              {PROGRAM_FIT.map((item, i) => (
                <div key={i} className="flex gap-6 items-start py-6 border-b border-slate-200 first:pt-0">
                  <span className="font-display text-3xl text-sky-200 leading-none w-12 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-24 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-14 max-w-xl">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
                Focus Areas
              </span>
              <h2 className="font-display text-3xl mt-1 leading-tight">
                What you’ll explore with us
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Tiga area utama yang akan jadi bagian dari pengalaman internship di CoreNexus Labs.
              </p>
            </div>

            <div>
              {ENGINEERING_TRACKS.map((track, i) => (
                <div
                  key={i}
                  className="group grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 items-start py-8 border-t border-slate-800 first:border-t-0 hover:border-sky-500 transition-colors duration-300"
                >
                  <div className="sm:col-span-1 font-display text-2xl text-slate-500 group-hover:text-sky-400 transition-colors">
                    {track.num}
                  </div>
                  <h3 className="sm:col-span-3 text-base font-bold uppercase tracking-wide">
                    {track.title}
                  </h3>
                  <p className="sm:col-span-7 text-sm text-slate-400 leading-relaxed">
                    {track.desc}
                  </p>
                  <ArrowUpRight className="sm:col-span-1 w-5 h-5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 justify-self-end" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 max-w-xl">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
                Your journey
              </span>
              <h2 className="font-display text-3xl text-slate-950 mt-1 leading-tight">
                The application flow
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Dibuat singkat, jelas, dan enak diikuti dari awal sampai akhir.
              </p>
            </div>

            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-px bg-slate-200 hidden sm:block" />
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 sm:gap-8 relative">
                {SELECTION_STEPS.map((flow, i) => (
                  <div key={i} className="space-y-4">
                    <div className="w-10 h-10 rounded-full bg-[#F5F7FB] border-2 border-slate-950 flex items-center justify-center font-display text-sm relative z-10 shadow-sm">
                      {flow.step}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                        {flow.title}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{flow.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 text-xs">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <p>&copy; 2026 CoreNexus Labs. All Rights Reserved.</p>
          <Link
            to="/login"
            className="text-slate-400 hover:text-slate-700 font-semibold flex items-center gap-1.5 transition-colors duration-150"
          >
            <Lock className="w-3 h-3" /> Team Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}