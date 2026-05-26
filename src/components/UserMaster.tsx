import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Users, Shield, User, Search, Mail, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import type { UserProfile } from '../utils/storage';

interface UserMasterProps {
  users: UserProfile[];
  onAddUser: (fullName: string, email: string, role: 'admin' | 'user') => void;
  onEditUser: (id: string, fullName: string, email: string, role: 'admin' | 'user') => void;
  onDeleteUser: (id: string) => void;
  darkMode: boolean;
}

export const UserMaster: React.FC<UserMasterProps> = ({
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
  darkMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on search
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const teamCount = users.filter(u => u.role === 'user').length;

  const handleAddNew = () => {
    Swal.fire({
      title: 'Tambah Pengguna Baru',
      html: `
        <div class="space-y-4 text-left text-xs font-sans text-slate-300">
          <div>
            <label class="block text-slate-400 font-bold mb-1">Nama Lengkap</label>
            <input id="swal-input-name" type="text" class="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold" placeholder="e.g. Yogi Fermana">
          </div>
          <div>
            <label class="block text-slate-400 font-bold mb-1">Alamat Email</label>
            <input id="swal-input-email" type="email" class="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold" placeholder="e.g. yogi@modena.com">
          </div>
          <div>
            <label class="block text-slate-400 font-bold mb-1">Hak Akses / Peran</label>
            <select id="swal-input-role" class="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold">
              <option value="user">👥 Team Member</option>
              <option value="admin">🛡️ Administrator</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      preConfirm: () => {
        const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
        const email = (document.getElementById('swal-input-email') as HTMLInputElement).value;
        const role = (document.getElementById('swal-input-role') as HTMLSelectElement).value as 'admin' | 'user';

        if (!name || !name.trim()) {
          Swal.showValidationMessage('Nama lengkap tidak boleh kosong!');
          return false;
        }
        if (!email || !email.trim()) {
          Swal.showValidationMessage('Email tidak boleh kosong!');
          return false;
        }
        // Simple email validation regex
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Format email tidak valid!');
          return false;
        }
        if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
          Swal.showValidationMessage('Email ini sudah terdaftar!');
          return false;
        }

        return { name: name.trim(), email: email.trim(), role };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { name, email, role } = result.value;
        onAddUser(name, email, role);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Pengguna berhasil ditambahkan!',
          showConfirmButton: false,
          timer: 1500,
          background: darkMode ? '#0f172a' : '#ffffff',
          color: darkMode ? '#f3f4f6' : '#1f2937',
        });
      }
    });
  };

  const handleEdit = (user: UserProfile) => {
    Swal.fire({
      title: 'Ubah Data Pengguna',
      html: `
        <div class="space-y-4 text-left text-xs font-sans text-slate-300">
          <div>
            <label class="block text-slate-400 font-bold mb-1">Nama Lengkap</label>
            <input id="swal-input-name" type="text" class="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold" value="${user.fullName}" placeholder="e.g. Yogi Fermana">
          </div>
          <div>
            <label class="block text-slate-400 font-bold mb-1">Alamat Email</label>
            <input id="swal-input-email" type="email" class="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold" value="${user.email}" placeholder="e.g. yogi@modena.com">
          </div>
          <div>
            <label class="block text-slate-400 font-bold mb-1">Hak Akses / Peran</label>
            <select id="swal-input-role" class="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold">
              <option value="user" ${user.role === 'user' ? 'selected' : ''}>👥 Team Member</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>🛡️ Administrator</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#f43f5e',
      confirmButtonText: 'Ubah',
      cancelButtonText: 'Batal',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#f3f4f6' : '#1f2937',
      preConfirm: () => {
        const name = (document.getElementById('swal-input-name') as HTMLInputElement).value;
        const email = (document.getElementById('swal-input-email') as HTMLInputElement).value;
        const role = (document.getElementById('swal-input-role') as HTMLSelectElement).value as 'admin' | 'user';

        if (!name || !name.trim()) {
          Swal.showValidationMessage('Nama lengkap tidak boleh kosong!');
          return false;
        }
        if (!email || !email.trim()) {
          Swal.showValidationMessage('Email tidak boleh kosong!');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Format email tidak valid!');
          return false;
        }
        if (email.trim().toLowerCase() !== user.email.toLowerCase() && users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
          Swal.showValidationMessage('Email ini sudah terdaftar!');
          return false;
        }

        return { name: name.trim(), email: email.trim(), role };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { name, email, role } = result.value;
        onEditUser(user.id, name, email, role);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Data pengguna berhasil diubah!',
          showConfirmButton: false,
          timer: 1500,
          background: darkMode ? '#0f172a' : '#ffffff',
          color: darkMode ? '#f3f4f6' : '#1f2937',
        });
      }
    });
  };

  const handleDelete = (user: UserProfile) => {
    Swal.fire({
      title: `Hapus Pengguna "${user.fullName}"?`,
      text: 'Akses pengguna ini ke portal akan segera dinonaktifkan!',
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
        onDeleteUser(user.id);
        Swal.fire({
          title: 'Terhapus!',
          text: 'Pengguna berhasil dihapus.',
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
            <Users className="w-5 h-5 text-indigo-500" />
            <span>Master Pengguna Portal</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Kelola akun pengguna, peran, dan hak akses portal By M-Click.</p>
        </div>
        
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto max-w-5xl w-full mx-auto space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 transition shadow-sm hover:shadow-md">
            <div className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 p-3.5 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Akun</p>
              <h3 className="text-xl font-bold mt-0.5">{totalUsers} Akun</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 transition shadow-sm hover:shadow-md">
            <div className="bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 p-3.5 rounded-2xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Administrator</p>
              <h3 className="text-xl font-bold mt-0.5">{adminCount} Akun</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center gap-4 transition shadow-sm hover:shadow-md">
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Team Member</p>
              <h3 className="text-xl font-bold mt-0.5">{teamCount} Akun</h3>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama atau email pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-550/5 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-xs"
            />
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Menampilkan {filteredUsers.length} dari {totalUsers} Pengguna</span>
        </div>

        {/* User List Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 px-6">Pengguna</th>
                <th className="p-4 px-6">Hak Akses</th>
                <th className="p-4 px-6">Tanggal Bergabung</th>
                <th className="p-4 px-6 text-right w-48">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    <User className="w-10 h-10 mx-auto mb-3 text-slate-350 dark:text-slate-700" />
                    <span>Tidak ada pengguna yang cocok dengan pencarian Anda.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition">
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-3">
                        {/* Custom initial Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-650 text-white font-extrabold flex items-center justify-center text-sm shadow">
                          {user.fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <span className="text-slate-900 dark:text-slate-100 text-sm font-semibold block">{user.fullName}</span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-indigo-400" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        user.role === 'admin' 
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30' 
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                      }`}>
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="w-3.5 h-3.5" />
                            <span>Administrator</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5" />
                            <span>Team Member</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-slate-450 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 px-3.5 py-2 rounded-xl transition text-xs font-semibold cursor-pointer"
                          title="Ubah Data"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Ubah</span>
                        </button>
                        
                        <button
                          onClick={() => handleDelete(user)}
                          className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-450 px-3.5 py-2 rounded-xl transition text-xs font-semibold cursor-pointer border border-rose-100 dark:border-transparent"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
