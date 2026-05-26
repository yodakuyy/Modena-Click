import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { storage } from './utils/storage';
import type { UserGuide, GuideStep, UserProfile } from './utils/storage';
import { Dashboard } from './components/Dashboard';
import { SandboxRecorder } from './components/SandboxRecorder';
import { StepEditor } from './components/StepEditor';
import { GuideViewer } from './components/GuideViewer';
import { ExportModal } from './components/ExportModal';
import { CategoryMaster } from './components/CategoryMaster';
import { UserMaster } from './components/UserMaster';
import { BookOpen, FolderKanban, MousePointerClick, LogOut, Users } from 'lucide-react';
import { supabase } from './utils/supabase';

function App() {
  const [guides, setGuides] = useState<UserGuide[]>([]);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'sandbox' | 'editor' | 'viewer'>('dashboard');
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [viewerOrigin, setViewerOrigin] = useState<'dashboard' | 'editor'>('dashboard');
  const [categories, setCategories] = useState<string[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'guides' | 'categories' | 'users'>('guides');

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
      setLoginError(err.message || 'Gagal masuk log melalui Supabase. Pastikan kredensial Anda benar.');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setEmail('');
    setPassword('');
    setCurrentScreen('dashboard');
  };

  // Initialize and load guides, categories, and users from storage and sync with Supabase cloud!
  useEffect(() => {
    // 1. Load instant cache
    setGuides(storage.getGuides());
    setCategories(storage.getCategories());
    setUsers(storage.getUsers());

    // 2. Sync asynchronously from Supabase cloud database
    const syncCloudData = async () => {
      const cloudGuides = await storage.fetchGuidesFromCloud();
      setGuides(cloudGuides);
      const cloudUsers = await storage.fetchUsersFromCloud();
      setUsers(cloudUsers);
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
    setCurrentScreen(userRole === 'admin' ? 'editor' : 'dashboard');

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

  const handleAddCategory = (categoryName: string) => {
    storage.addCategory(categoryName);
    setCategories(storage.getCategories());
  };

  const handleEditCategory = (oldName: string, newName: string) => {
    storage.editCategory(oldName, newName);
    setCategories(storage.getCategories());

    // Also update any guides using this category
    const updatedGuides = guides.map(g => {
      if (g.category === oldName) {
        const newG = { ...g, category: newName };
        storage.saveGuide(newG);
        return newG;
      }
      return g;
    });
    setGuides(updatedGuides);
  };

  const handleDeleteCategory = (categoryName: string) => {
    storage.deleteCategory(categoryName);
    setCategories(storage.getCategories());

    // Fallback guides using this category to "IT Operations"
    const updatedGuides = guides.map(g => {
      if (g.category === categoryName) {
        const newG = { ...g, category: 'IT Operations' };
        storage.saveGuide(newG);
        return newG;
      }
      return g;
    });
    setGuides(updatedGuides);
  };

  const handleAddUser = (fullName: string, email: string, role: 'admin' | 'user') => {
    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      email,
      fullName,
      role,
      createdAt: new Date().toISOString()
    };
    storage.saveUser(newUser);
    setUsers(storage.getUsers());
  };

  const handleEditUser = (id: string, fullName: string, email: string, role: 'admin' | 'user') => {
    const userToUpdate = users.find(u => u.id === id);
    if (userToUpdate) {
      const updatedUser: UserProfile = {
        ...userToUpdate,
        fullName,
        email,
        role
      };
      storage.saveUser(updatedUser);
      setUsers(storage.getUsers());
    }
  };

  const handleDeleteUser = (id: string) => {
    storage.deleteUser(id);
    setUsers(storage.getUsers());
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
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
          {/* Left Sidebar */}
          <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-5 transition-colors">
            <div className="space-y-6">
              {/* Brand Logo */}
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 text-white flex-shrink-0">
                  <MousePointerClick className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent leading-none mb-1">
                    By M-Click
                  </h1>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    userRole === 'admin'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-150 dark:border-emerald-900/30'
                  }`}>
                    {userRole === 'admin' ? '🛡️ Admin' : '👥 Team'}
                  </span>
                </div>
              </div>

              {/* Menu Navigation */}
              <nav className="space-y-1.5 pt-4">
                <button
                  onClick={() => setActiveTab('guides')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'guides'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Daftar Panduan</span>
                </button>

                {userRole === 'admin' && (
                  <button
                    onClick={() => setActiveTab('categories')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'categories'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    <span>Master Kategori</span>
                  </button>
                )}

                {userRole === 'admin' && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Master User</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 transition text-xs font-semibold cursor-pointer"
              >
                <span>{darkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap'}</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-450 font-bold px-4 py-2.5 rounded-xl text-xs border border-rose-200/50 dark:border-rose-900/30 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Portal</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <main className="flex-1 flex flex-col overflow-y-auto">
            {activeTab === 'guides' && (
              <Dashboard
                guides={guides}
                onCreateNew={handleCreateNew}
                onEditGuide={handleEditGuide}
                onPlayGuide={handlePlayGuide}
                onDeleteGuide={handleDeleteGuide}
                userRole={userRole}
                categories={categories}
              />
            )}
            {activeTab === 'categories' && (
              <CategoryMaster
                categories={categories}
                guides={guides}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
                darkMode={darkMode}
              />
            )}
            {activeTab === 'users' && (
              <UserMaster
                users={users}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                darkMode={darkMode}
              />
            )}
          </main>
        </div>
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
          categories={categories}
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
