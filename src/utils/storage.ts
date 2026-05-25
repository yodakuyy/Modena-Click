import { supabase } from './supabase';

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  actionType: 'click' | 'input' | 'select' | 'nav' | 'custom';
  targetElement: string;
  xPercent: number;
  yPercent: number;
  inputValue?: string;
  calloutType?: 'info' | 'warning' | 'tip' | 'success' | null;
  calloutText?: string;
  customScreenshot?: string;
  sandboxState?: {
    tab: string;
    modalOpen?: boolean;
    formData?: Record<string, string>;
    selectedTicketId?: string;
    activeItem?: string;
  };
}

export interface UserGuide {
  id: string;
  title: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  steps: GuideStep[];
}

const STORAGE_KEY = 'by_m_click_user_guides';
const OLD_STORAGE_KEY = 'by_click_user_guides';

const SEED_GUIDES: UserGuide[] = [
  {
    id: 'guide-default-1',
    title: 'Cara Membuat Tiket Prioritas Tinggi di ZetaCRM',
    description: 'Panduan lengkap langkah demi langkah untuk mendaftarkan tiket gangguan baru dengan tingkat prioritas tinggi (High SLA) untuk pelanggan premium.',
    author: 'Yogi Fermana',
    category: 'Customer Service',
    tags: ['ZetaCRM', 'Ticketing', 'SLA High'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    steps: [
      {
        id: 'step-1',
        title: 'Navigasi ke Tab Tiket Layanan',
        description: 'Buka menu tiket di sidebar untuk mengakses seluruh daftar antrean bantuan pelanggan.',
        actionType: 'nav',
        targetElement: 'Menu Sidebar "Tickets"',
        xPercent: 12,
        yPercent: 22,
        sandboxState: {
          tab: 'dashboard',
          modalOpen: false
        }
      },
      {
        id: 'step-2',
        title: 'Klik Tombol "Create Ticket"',
        description: 'Tombol ini terletak di pojok kanan atas tabel daftar tiket. Klik untuk membuka form pembuatan tiket baru.',
        actionType: 'click',
        targetElement: 'Tombol "Create Ticket"',
        xPercent: 88,
        yPercent: 18,
        sandboxState: {
          tab: 'tickets',
          modalOpen: false
        }
      },
      {
        id: 'step-3',
        title: 'Isi Subjek Permasalahan Tiket',
        description: 'Ketik ringkasan masalah pada kolom input Subject. Pastikan informatif dan jelas.',
        actionType: 'input',
        targetElement: 'Kolom Input "Subject"',
        inputValue: 'Server Utama Mengalami Down / Overload',
        xPercent: 45,
        yPercent: 36,
        calloutType: 'tip',
        calloutText: 'Gunakan format [NAMA LAYANAN] - [DESKRIPSI SINGKAT] agar tim teknis dapat melakukan klasifikasi lebih cepat.',
        sandboxState: {
          tab: 'tickets',
          modalOpen: true,
          formData: {
            subject: 'Server Utama Mengalami Down / Overload',
            category: 'Technical',
            priority: 'medium',
            description: ''
          }
        }
      },
      {
        id: 'step-4',
        title: 'Ubah Prioritas Menjadi "High"',
        description: 'Buka menu dropdown Priority, lalu ganti nilai dari "Medium" menjadi "High" untuk mengaktifkan SLA 2 jam.',
        actionType: 'select',
        targetElement: 'Dropdown "Priority"',
        inputValue: 'High',
        xPercent: 45,
        yPercent: 55,
        calloutType: 'warning',
        calloutText: 'Menetapkan tiket ke tingkat HIGH akan mengirim notifikasi darurat langsung ke channel Slack tim DevOps!',
        sandboxState: {
          tab: 'tickets',
          modalOpen: true,
          formData: {
            subject: 'Server Utama Mengalami Down / Overload',
            category: 'Technical',
            priority: 'high',
            description: ''
          }
        }
      },
      {
        id: 'step-5',
        title: 'Klik Tombol "Submit Ticket"',
        description: 'Tekan tombol Submit di bagian bawah modal untuk menyimpan tiket dan memicu sistem otomatisasi eskalasi.',
        actionType: 'click',
        targetElement: 'Tombol "Submit Ticket"',
        xPercent: 62,
        yPercent: 78,
        sandboxState: {
          tab: 'tickets',
          modalOpen: true,
          formData: {
            subject: 'Server Utama Mengalami Down / Overload',
            category: 'Technical',
            priority: 'high',
            description: 'Tolong eskalasi segera ke Devops, database overload.'
          }
        }
      }
    ]
  }
];

export const storage = {
  getGuides(): UserGuide[] {
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const oldData = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldData) {
        localStorage.setItem(STORAGE_KEY, oldData);
        data = oldData;
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_GUIDES));
        return SEED_GUIDES;
      }
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_GUIDES;
    }
  },

  saveGuides(guides: UserGuide[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guides));
  },

  // Asynchronous cloud synchronizations with Supabase
  async fetchGuidesFromCloud(): Promise<UserGuide[]> {
    try {
      const { data, error } = await supabase
        .from('user_guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const parsedGuides = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          author: item.author,
          category: item.category,
          tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags,
          createdAt: item.created_at || new Date().toISOString(),
          steps: typeof item.steps === 'string' ? JSON.parse(item.steps) : item.steps
        })) as UserGuide[];

        // Sync back to local storage cache
        this.saveGuides(parsedGuides);
        return parsedGuides;
      }
      
      // If Supabase table is empty, seed it with our default CRM seed guide!
      const local = this.getGuides();
      for (const g of local) {
        await this.saveGuideCloud(g);
      }
      return local;
    } catch (err) {
      console.warn('Gagal sinkronisasi data dari Supabase, menggunakan cache offline lokal:', err);
      return this.getGuides();
    }
  },

  async saveGuideCloud(guide: UserGuide): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_guides')
        .upsert({
          id: guide.id,
          title: guide.title,
          description: guide.description,
          author: guide.author,
          category: guide.category,
          tags: guide.tags,
          created_at: guide.createdAt,
          steps: guide.steps
        });

      if (error) throw error;
    } catch (err) {
      console.error('Gagal menyimpan panduan ke Supabase Cloud:', err);
    }
  },

  async deleteGuideCloud(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_guides')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Gagal menghapus panduan di Supabase Cloud:', err);
    }
  },

  getGuideById(id: string): UserGuide | undefined {
    const guides = this.getGuides();
    return guides.find(g => g.id === id);
  },

  saveGuide(guide: UserGuide): void {
    // 1. Update instant local cache
    const guides = this.getGuides();
    const index = guides.findIndex(g => g.id === guide.id);
    if (index >= 0) {
      guides[index] = guide;
    } else {
      guides.push(guide);
    }
    this.saveGuides(guides);

    // 2. Synchronize to Supabase Cloud asynchronously in background
    this.saveGuideCloud(guide);
  },

  deleteGuide(id: string): void {
    // 1. Delete from instant local cache
    const guides = this.getGuides();
    const filtered = guides.filter(g => g.id !== id);
    this.saveGuides(filtered);

    // 2. Delete from Supabase Cloud asynchronously in background
    this.deleteGuideCloud(id);
  }
};
