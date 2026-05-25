import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { storage } from './utils/storage';
import type { UserGuide, GuideStep } from './utils/storage';
import { Dashboard } from './components/Dashboard';
import { SandboxRecorder } from './components/SandboxRecorder';
import { StepEditor } from './components/StepEditor';
import { GuideViewer } from './components/GuideViewer';
import { ExportModal } from './components/ExportModal';
import { supabase } from './utils/supabase';

function App() {
  const [guides, setGuides] = useState<UserGuide[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'sandbox' | 'editor' | 'viewer'>('dashboard');
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [viewerOrigin, setViewerOrigin] = useState<'dashboard' | 'editor'>('dashboard');

  // User Role & Portal state
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw error;
      }

      const user = data.user;
      if (!user) throw new Error('User tidak ditemukan.');

      // Differentiate roles based on email or custom Supabase user metadata!
      const userEmail = user.email?.toLowerCase();
      const metadataRole = user.user_metadata?.role;
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name;

      let role: 'admin' | 'user' = 'user';
      let roleName = fullName ? `${fullName} User` : 'User';

      if (
        userEmail === 'admin.click@modena.com' ||
        metadataRole === 'admin'
      ) {
        role = 'admin';
        roleName = fullName ? `Administrator ${fullName}` : 'Administrator';
      }

      setUserRole(role);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Login Sukses (Supabase Auth)!',
        text: `Masuk sebagai ${roleName}.`,
        showConfirmButton: false,
        timer: 1500,
        background: darkMode ? '#0f172a' : '#ffffff',
        color: darkMode ? '#f3f4f6' : '#1f2937',
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Gagal login via Supabase. Pastikan kredensial lo benar.');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setEmail('');
    setPassword('');
    setCurrentScreen('dashboard');
  };

  // Initialize and load guides from local storage and sync with Supabase cloud!
  useEffect(() => {
    // 1. Load instant cache
    setGuides(storage.getGuides());

    // 2. Sync asynchronously from Supabase cloud database
    const syncCloudData = async () => {
      const cloudGuides = await storage.fetchGuidesFromCloud();
      setGuides(cloudGuides);
    };
    syncCloudData();
  }, []);

  // Sync dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Listen to incoming recorded guides from the By M-Click Chrome Extension!
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'by-click-extension') {
        const recordedGuide = event.data.guide;
        if (!recordedGuide) return;

        // Save guide to localStorage
        storage.saveGuide(recordedGuide);

        // Refresh local guides list
        setGuides(storage.getGuides());

        // Load in editor instantly!
        setActiveGuideId(recordedGuide.id);
        setCurrentScreen('editor');

        // Show a beautiful SweetAlert popup
        Swal.fire({
          icon: 'success',
          title: 'Guide Diimpor Otomatis!',
          text: `Panduan "${recordedGuide.title}" berhasil di-sync dari Chrome Extension Modena.`,
          confirmButtonColor: '#6366f1',
          background: darkMode ? '#0f172a' : '#ffffff',
          color: darkMode ? '#f3f4f6' : '#1f2937',
        });
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, [darkMode]);

  const handleCreateNew = () => {
    setCurrentScreen('sandbox');
  };

  const handleSaveRecordedGuide = (
    title: string,
    desc: string,
    category: string,
    tags: string[],
    steps: GuideStep[]
  ) => {
    const newGuide: UserGuide = {
      id: `guide-${Date.now()}`,
      title,
      description: desc,
      author: 'Yogi Fermana',
      category,
      tags,
      createdAt: new Date().toISOString(),
      steps
    };

    storage.saveGuide(newGuide);
    setGuides(storage.getGuides());
    setActiveGuideId(newGuide.id);
    setCurrentScreen('editor');

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937',
    });
    Toast.fire({
      icon: 'success',
      title: 'Panduan berhasil direkam!'
    });
  };

  const handleSaveEditedGuide = (updatedGuide: UserGuide) => {
    storage.saveGuide(updatedGuide);
    setGuides(storage.getGuides());
    setCurrentScreen('dashboard');

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937',
    });
    Toast.fire({
      icon: 'success',
      title: 'Panduan berhasil diperbarui!'
    });
  };

  const handlePreviewGuide = (updatedGuide: UserGuide) => {
    setGuides(prev => prev.map(g => g.id === updatedGuide.id ? updatedGuide : g));
    setViewerOrigin('editor');
    setCurrentScreen('viewer');
  };

  const handleExportGuide = (updatedGuide: UserGuide) => {
    setGuides(prev => prev.map(g => g.id === updatedGuide.id ? updatedGuide : g));
    setShowExportModal(true);
  };

  const handleEditGuide = (id: string) => {
    setActiveGuideId(id);
    setCurrentScreen('editor');
  };

  const handlePlayGuide = (id: string) => {
    setActiveGuideId(id);
    setViewerOrigin('dashboard');
    setCurrentScreen('viewer');
  };

  const handleDeleteGuide = (id: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Panduan yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1', // indigo-500
      cancelButtonColor: '#f43f5e', // rose-500
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937',
    }).then((result) => {
      if (result.isConfirmed) {
        storage.deleteGuide(id);
        setGuides(storage.getGuides());
        Swal.fire({
          title: 'Terhapus!',
          text: 'Panduan Anda berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#6366f1',
          background: darkMode ? '#0f172a' : '#ffffff',
          color: darkMode ? '#f3f4f6' : '#1f2937',
        });
      }
    });
  };

  const activeGuide = activeGuideId ? guides.find(g => g.id === activeGuideId) : null;

  // Render Premium Modena Login Page if not authenticated
  if (userRole === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 font-sans relative overflow-hidden">
        {/* Background gradient lights */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"></div>

        <div className="max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center z-10 animate-in fade-in zoom-in duration-300 px-4">

          {/* Left Hero Brand Promo */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full border border-indigo-500/35 uppercase tracking-widest flex items-center gap-1.5 w-fit mx-auto md:mx-0">
              ⚡ MODENA ENTERPRISE PORTAL
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              By M-Click
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Portal panduan operasional kerja dan dokumentasi otomatis tim Modena. Posisikan peran Anda untuk memulai.
            </p>
          </div>

          {/* Right Login / Role selection panel */}
          <div className="w-full md:w-[420px] bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-bold text-white mb-1">Masuk ke Portal</h2>
              <p className="text-xs text-slate-400">Silakan masukkan email dan password terdaftar Anda</p>
            </div>

            {/* Form Login */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[9px]">Username / Email</label>
                <input
                  type="text"
                  placeholder="test@modena.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wider text-[9px]">Password</label>
                <input
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
              </div>

              {loginError && (
                <p className="text-[10px] text-rose-500 font-semibold text-center leading-relaxed">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 cursor-pointer text-center text-xs"
              >
                Masuk Portal M-Click
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors duration-300">

      {/* RENDER SCREENS */}
      {currentScreen === 'dashboard' && (
        <Dashboard
          guides={guides}
          onCreateNew={handleCreateNew}
          onEditGuide={handleEditGuide}
          onPlayGuide={handlePlayGuide}
          onDeleteGuide={handleDeleteGuide}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'sandbox' && (
        <SandboxRecorder
          onSave={handleSaveRecordedGuide}
          onCancel={() => setCurrentScreen('dashboard')}
        />
      )}

      {currentScreen === 'editor' && activeGuide && userRole === 'admin' && (
        <StepEditor
          guide={activeGuide}
          onSave={handleSaveEditedGuide}
          onBack={() => setCurrentScreen('dashboard')}
          onPlay={handlePreviewGuide}
          onExport={handleExportGuide}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      {currentScreen === 'viewer' && activeGuide && (
        <GuideViewer
          guide={activeGuide}
          onClose={() => setCurrentScreen(viewerOrigin === 'editor' && userRole === 'admin' ? 'editor' : 'dashboard')}
        />
      )}

      {/* GLOBAL MODALS */}
      {showExportModal && activeGuide && (
        <ExportModal
          guide={activeGuide}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;
