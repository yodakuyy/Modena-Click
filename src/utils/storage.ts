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

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  createdAt: string;
}

const STORAGE_KEY = 'by_m_click_user_guides';
const OLD_STORAGE_KEY = 'by_click_user_guides';

const CATEGORY_STORAGE_KEY = 'by_m_click_categories';

const USER_STORAGE_KEY = 'by_m_click_users';

export const storage = {
  getGuides(): UserGuide[] {
    let data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      const oldData = localStorage.getItem(OLD_STORAGE_KEY);
      if (oldData) {
        localStorage.setItem(STORAGE_KEY, oldData);
        data = oldData;
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
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

      const localGuides = this.getGuides();

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

        // Merge logic: Combine cloud guides and local guides
        // Cloud guides take precedence for matching IDs. Local-only guides are preserved and synced to the cloud.
        const mergedGuidesMap = new Map<string, UserGuide>();
        
        // Add all cloud guides first
        parsedGuides.forEach(g => mergedGuidesMap.set(g.id, g));
        
        // Process local guides to make sure we don't delete local-only guides or overwrite newer local edits
        for (const localGuide of localGuides) {
          if (!mergedGuidesMap.has(localGuide.id)) {
            // Local-only guide: Keep it and try to sync to the cloud in the background
            mergedGuidesMap.set(localGuide.id, localGuide);
            this.saveGuideCloud(localGuide);
          } else {
            // Guide exists in both. Compare createdAt to see if local is newer (offline edit)
            const cloudGuide = mergedGuidesMap.get(localGuide.id)!;
            if (new Date(localGuide.createdAt) > new Date(cloudGuide.createdAt)) {
              mergedGuidesMap.set(localGuide.id, localGuide);
              this.saveGuideCloud(localGuide);
            }
          }
        }

        const mergedGuides = Array.from(mergedGuidesMap.values());
        // Sort by createdAt descending
        mergedGuides.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Sync back to local storage cache
        this.saveGuides(mergedGuides);
        return mergedGuides;
      }
      
      return localGuides;
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
  },

  getCategories(): string[] {
    let data = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveCategories(categories: string[]): void {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  },

  async fetchCategoriesFromCloud(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_categories')
        .select('name')
        .order('name', { ascending: true });

      if (error) throw error;

      const localCategories = this.getCategories();

      if (data && data.length > 0) {
        const cloudNames = data.map(item => item.name);
        
        // Merge logic: Combine cloud categories and local categories
        const mergedSet = new Set<string>();
        cloudNames.forEach(c => mergedSet.add(c));
        
        // Process local categories to make sure we don't delete local-only ones
        for (const localCat of localCategories) {
          if (!mergedSet.has(localCat)) {
            mergedSet.add(localCat);
            this.saveCategoryCloud(localCat);
          }
        }

        const mergedCategories = Array.from(mergedSet);
        mergedCategories.sort(); // Alphabetical sort

        // Sync back to local storage cache
        this.saveCategories(mergedCategories);
        return mergedCategories;
      }
      
      return localCategories;
    } catch (err) {
      console.warn('Gagal sinkronisasi kategori dari Supabase, menggunakan cache offline lokal:', err);
      return this.getCategories();
    }
  },

  async saveCategoryCloud(categoryName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_categories')
        .upsert({
          name: categoryName
        }, { onConflict: 'name' });

      if (error) throw error;
    } catch (err) {
      console.error('Gagal menyimpan kategori ke Supabase Cloud:', err);
    }
  },

  async deleteCategoryCloud(categoryName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_categories')
        .delete()
        .eq('name', categoryName);

      if (error) throw error;
    } catch (err) {
      console.error('Gagal menghapus kategori di Supabase Cloud:', err);
    }
  },

  async updateCategoryCloud(oldName: string, newName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_categories')
        .update({ name: newName })
        .eq('name', oldName);

      if (error) throw error;
    } catch (err) {
      console.error('Gagal memperbarui kategori di Supabase Cloud:', err);
    }
  },

  addCategory(categoryName: string): void {
    const categories = this.getCategories();
    if (!categories.includes(categoryName)) {
      categories.push(categoryName);
      this.saveCategories(categories);
      this.saveCategoryCloud(categoryName);
    }
  },

  editCategory(oldName: string, newName: string): void {
    const categories = this.getCategories();
    const updated = categories.map(c => c === oldName ? newName : c);
    this.saveCategories(updated);
    this.updateCategoryCloud(oldName, newName);
  },

  deleteCategory(categoryName: string): void {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c !== categoryName);
    this.saveCategories(filtered);
    this.deleteCategoryCloud(categoryName);
  },

  getUsers(): UserProfile[] {
    let data = localStorage.getItem(USER_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Deduplicate local storage by email in case of duplicates from prior runs!
        const uniqueMap = new Map<string, UserProfile>();
        parsed.forEach(u => {
          const emailKey = u.email.toLowerCase();
          if (!uniqueMap.has(emailKey)) {
            uniqueMap.set(emailKey, u);
          } else {
            const existing = uniqueMap.get(emailKey)!;
            // Prefer UUID formatted IDs over mock IDs
            const existingIsMock = existing.id.includes('user-default') || existing.id.length < 30;
            const currentIsMock = u.id.includes('user-default') || u.id.length < 30;
            if (existingIsMock && !currentIsMock) {
              uniqueMap.set(emailKey, u);
            } else if (new Date(u.createdAt) > new Date(existing.createdAt)) {
              uniqueMap.set(emailKey, u);
            }
          }
        });
        const deduplicated = Array.from(uniqueMap.values());
        return deduplicated;
      }
      return [];
    } catch {
      return [];
    }
  },

  saveUsers(users: UserProfile[]): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
  },

  async fetchUsersFromCloud(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const localUsers = this.getUsers();

      if (data && data.length > 0) {
        const parsedUsers = data.map(item => ({
          id: item.id,
          email: item.email,
          fullName: item.full_name,
          role: item.role as 'admin' | 'user',
          createdAt: item.created_at || new Date().toISOString()
        })) as UserProfile[];

        // Merge logic: Combine cloud users and local users by EMAIL as unique key to prevent duplicates
        const mergedUsersMap = new Map<string, UserProfile>();
        
        // Add all cloud users first
        parsedUsers.forEach(u => mergedUsersMap.set(u.email.toLowerCase(), u));
        
        // Process local users to make sure we don't delete local-only users or duplicate by email
        for (const localUser of localUsers) {
          const emailKey = localUser.email.toLowerCase();
          if (!mergedUsersMap.has(emailKey)) {
            // Local-only user: Keep it and try to sync to the cloud
            mergedUsersMap.set(emailKey, localUser);
            this.saveUserCloud(localUser);
          } else {
            // User exists in both. Compare createdAt to see if local is newer, but keep cloud's valid UUID ID!
            const cloudUser = mergedUsersMap.get(emailKey)!;
            if (new Date(localUser.createdAt) > new Date(cloudUser.createdAt)) {
              const updatedUser = {
                ...localUser,
                id: cloudUser.id // Keep cloud's valid ID
              };
              mergedUsersMap.set(emailKey, updatedUser);
              this.saveUserCloud(updatedUser);
            }
          }
        }

        const mergedUsers = Array.from(mergedUsersMap.values());
        mergedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Sync back to local storage cache
        this.saveUsers(mergedUsers);
        return mergedUsers;
      }
      
      return localUsers;
    } catch (err) {
      console.warn('Gagal sinkronisasi user dari Supabase, menggunakan cache offline lokal:', err);
      return this.getUsers();
    }
  },

  async saveUserCloud(user: UserProfile): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          created_at: user.createdAt
        });

      if (error) throw error;
    } catch (err) {
      console.error('Gagal menyimpan user ke Supabase Cloud:', err);
    }
  },

  async deleteUserCloud(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Gagal menghapus user di Supabase Cloud:', err);
    }
  },

  saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.saveUsers(users);
    this.saveUserCloud(user);
  },

  deleteUser(id: string): void {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    this.saveUsers(filtered);
    this.deleteUserCloud(id);
  }
};
