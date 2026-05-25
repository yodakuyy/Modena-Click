import React, { useState } from 'react';
import type { UserGuide } from '../utils/storage';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Calendar, 
  User, 
  Trash2, 
  Edit3, 
  Play, 
  Sparkles, 
  MousePointerClick,
  Layers,
  Clock
} from 'lucide-react';

interface DashboardProps {
  guides: UserGuide[];
  onCreateNew: () => void;
  onEditGuide: (id: string) => void;
  onPlayGuide: (id: string) => void;
  onDeleteGuide: (id: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  userRole: 'admin' | 'user';
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  guides,
  onCreateNew,
  onEditGuide,
  onPlayGuide,
  onDeleteGuide,
  darkMode,
  setDarkMode,
  userRole,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Derive categories and tags
  const categories = ['All', ...Array.from(new Set(guides.map(g => g.category)))];
  const tags = ['All', ...Array.from(new Set(guides.flatMap(g => g.tags)))];

  // Filter logic
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          guide.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || guide.category === selectedCategory;
    const matchesTag = selectedTag === 'All' || guide.tags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  // Calculate quick metrics
  const totalGuides = guides.length;
  const totalSteps = guides.reduce((acc, g) => acc + g.steps.length, 0);
  const avgSteps = totalGuides > 0 ? Math.round(totalSteps / totalGuides) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <MousePointerClick className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  By M-Click
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  userRole === 'admin'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                }`}>
                  {userRole === 'admin' ? '🛡️ Admin' : '👥 Team'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Modena Scribe-like User Guide Builder</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Create New CTA (Only for Admin) */}
            {userRole === 'admin' && (
              <button
                onClick={onCreateNew}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Create Guide</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold px-4 py-2.5 rounded-xl text-xs border border-rose-200/50 dark:border-rose-900/30 transition cursor-pointer"
              title="Logout from portal"
            >
              🚪 <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Block */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-10 mb-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-950/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
          
          <div className="relative z-10 max-w-2xl">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-widest flex items-center gap-1.5 w-fit mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Internal
            </span>
            <h2 className="text-3.5xl font-bold mb-3 tracking-tight">
              {userRole === 'admin' 
                ? 'Dokumentasikan Aplikasi Tim dalam Sekali Klik!' 
                : 'Portal Panduan Kerja & SOP Modena'}
            </h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              {userRole === 'admin'
                ? 'Buat panduan langkah-demi-langkah berkualitas tinggi untuk tim Service Desk, QA, atau operasional. Rekam interaksi di Sandbox, lakukan anotasi screenshot, lalu bagikan secara instan.'
                : 'Temukan panduan langkah-demi-langkah berkualitas tinggi untuk mempermudah pekerjaan operasional Anda di Modena. Klik "Buka Panduan" untuk mempelajari workflow secara interaktif.'}
            </p>
            {userRole === 'admin' && (
              <div className="flex gap-4">
                <button 
                  onClick={onCreateNew}
                  className="bg-white hover:bg-slate-100 text-indigo-950 font-bold px-6 py-3 rounded-xl shadow-md transition hover:scale-[1.02] cursor-pointer"
                >
                  Mulai Rekam Guide Baru
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4 transition shadow-sm hover:shadow-md">
            <div className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 p-4 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Total Guides</p>
              <h3 className="text-2xl font-bold mt-0.5">{totalGuides}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4 transition shadow-sm hover:shadow-md">
            <div className="bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 p-4 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Total Steps Captured</p>
              <h3 className="text-2xl font-bold mt-0.5">{totalSteps}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center gap-4 transition shadow-sm hover:shadow-md">
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Rata-rata Steps / Guide</p>
              <h3 className="text-2xl font-bold mt-0.5">{avgSteps} steps</h3>
            </div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl mb-8 transition shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul, konten, atau pembuat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto justify-end">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Kategori:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Tag:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {tags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Guides Grid */}
        {filteredGuides.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center max-w-lg mx-auto shadow-sm">
            <div className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Panduan Tidak Ditemukan</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              Coba bersihkan filter pencarian atau buat panduan pertamamu sekarang juga!
            </p>
            <button 
              onClick={onCreateNew}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
            >
              Buat Panduan Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map(guide => (
              <div 
                key={guide.id}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Visual Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                      {guide.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Layers className="w-3.5 h-3.5" />
                      {guide.steps.length} Steps
                    </span>
                  </div>

                  <h3 className="text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-2 tracking-tight line-clamp-2">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {guide.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {guide.tags.map(t => (
                      <span key={t} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer and Actions */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Meta */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="font-semibold">{guide.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(guide.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {userRole === 'admin' ? (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => onPlayGuide(guide.id)}
                        className="flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        title="Play Guide"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play</span>
                      </button>
                      <button
                        onClick={() => onEditGuide(guide.id)}
                        className="flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        title="Edit steps and annotations"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteGuide(guide.id)}
                        className="flex items-center justify-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition py-2 rounded-xl text-xs font-semibold cursor-pointer"
                        title="Delete Guide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onPlayGuide(guide.id)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-indigo-500/15 hover:scale-[1.01] active:scale-[0.99]"
                      title="Buka dan Pelajari Panduan"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Buka & Pelajari Panduan</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
