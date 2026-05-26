import React from 'react';
import { Plus, Trash2, Edit3, FolderKanban, Info, Layers } from 'lucide-react';
import Swal from 'sweetalert2';
import type { UserGuide } from '../utils/storage';

interface CategoryMasterProps {
  categories: string[];
  guides: UserGuide[];
  onAddCategory: (categoryName: string) => void;
  onEditCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  darkMode: boolean;
}

export const CategoryMaster: React.FC<CategoryMasterProps> = ({
  categories,
  guides,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  darkMode
}) => {
  // Count guides per category
  const getGuideCount = (catName: string) => {
    return guides.filter(g => g.category === catName).length;
  };

  const handleAddNew = () => {
    Swal.fire({
      title: 'Tambah Kategori Baru',
      input: 'text',
      inputPlaceholder: 'Masukkan nama kategori...',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Nama kategori tidak boleh kosong!';
        }
        if (categories.some(c => c.toLowerCase() === value.trim().toLowerCase())) {
          return 'Nama kategori sudah terdaftar!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        onAddCategory(result.value.trim());
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Kategori berhasil ditambahkan!',
          showConfirmButton: false,
          timer: 1500,
          background: darkMode ? '#0f172a' : '#ffffff',
          color: darkMode ? '#f3f4f6' : '#1f2937',
        });
      }
    });
  };

  const handleEdit = (oldName: string) => {
    Swal.fire({
      title: 'Ubah Nama Kategori',
      input: 'text',
      inputValue: oldName,
      inputPlaceholder: 'Masukkan nama kategori baru...',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Ubah',
      cancelButtonText: 'Batal',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Nama kategori tidak boleh kosong!';
        }
        if (value.trim() !== oldName && categories.some(c => c.toLowerCase() === value.trim().toLowerCase())) {
          return 'Nama kategori sudah terdaftar!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        onEditCategory(oldName, result.value.trim());
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Kategori berhasil diubah!',
          showConfirmButton: false,
          timer: 1500,
          background: darkMode ? '#0f172a' : '#ffffff',
          color: darkMode ? '#f3f4f6' : '#1f2937',
        });
      }
    });
  };

  const handleDelete = (catName: string) => {
    const usageCount = getGuideCount(catName);
    let warningText = 'Kategori yang dihapus tidak dapat dikembalikan!';
    if (usageCount > 0) {
      warningText = `Peringatan: Terdapat ${usageCount} panduan aktif yang menggunakan kategori ini. Jika Anda menghapus kategori ini, panduan tersebut akan secara otomatis dipindahkan ke kategori default "IT Operations"!`;
    }

    Swal.fire({
      title: `Hapus Kategori "${catName}"?`,
      text: warningText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#6366f1',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937',
    }).then((result) => {
      if (result.isConfirmed) {
        onDeleteCategory(catName);
        Swal.fire({
          title: 'Terhapus!',
          text: 'Kategori berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#6366f1',
          background: darkMode ? '#0f172a' : '#ffffff',
          color: darkMode ? '#f3f4f6' : '#1f2937',
        });
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Top Header Panel */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4.5 flex justify-between items-center transition-colors">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-500" />
            <span>Master Kategori Panduan</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kelola kategori kerja master untuk tim operasional dan CRM.</p>
        </div>
        
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto max-w-5xl w-full mx-auto">
        {/* Info Card */}
        <div className="bg-indigo-500/10 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 p-4.5 rounded-2xl mb-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex gap-3 items-start">
          <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">Panduan Pengelolaan Kategori Master</span>
            Kategori master ini digunakan untuk mengelompokkan panduan operasional Modena. Anda dapat menambahkan kategori baru yang relevan dengan tim kerja Anda, mengubah nama kategori yang telah ada, atau menghapus kategori yang sudah tidak diperlukan.
          </div>
        </div>

        {/* Categories Table/List Grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 px-6">Nama Kategori</th>
                <th className="p-4 px-6 text-center w-40">Total Panduan</th>
                <th className="p-4 px-6 text-right w-48">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-medium">
              {categories.map((cat, index) => {
                const count = getGuideCount(cat);
                return (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 w-8 h-8 rounded-xl flex items-center justify-center font-bold">
                          {cat.charAt(0)}
                        </div>
                        <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold">{cat}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        count > 0 
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30' 
                          : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
                      }`}>
                        <Layers className="w-3.5 h-3.5" />
                        {count} Panduan
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-3.5 py-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                          title="Ubah Nama"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Ubah</span>
                        </button>
                        
                        <button
                          onClick={() => handleDelete(cat)}
                          className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-3.5 py-2 rounded-xl transition text-xs font-semibold cursor-pointer border border-rose-100 dark:border-transparent"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
