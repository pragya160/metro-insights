import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  INITIAL_COMPLAINTS,
  INITIAL_NOTICES,
  DISTRICTS,
  MAP_HOTSPOTS,
  PRIORITY_SIGNALS,
} from '../data/demoData';
import {
  Complaint,
  ComplaintStatus,
  DistrictData,
  DistrictName,
  NoticeItem,
  UserProfile,
} from '../types';

const STORAGE_KEYS = {
  COMPLAINTS: 'metro_insights_complaints_v1',
  NOTICES: 'metro_insights_notices_v1',
  DISTRICTS: 'metro_insights_districts_v1',
  USER: 'metro_insights_current_user_v1',
};

// Listeners for data change reactivity
type Listener = () => void;
const listeners: Set<Listener> = new Set();
export function subscribeToDataChanges(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function notifyChange() {
  listeners.forEach((l) => l());
}

export class DataService {
  // Initialize storage if needed
  private static initLocalData() {
    if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
      localStorage.setItem(
        STORAGE_KEYS.COMPLAINTS,
        JSON.stringify(INITIAL_COMPLAINTS)
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
      localStorage.setItem(
        STORAGE_KEYS.NOTICES,
        JSON.stringify(INITIAL_NOTICES)
      );
    }
    if (!localStorage.getItem(STORAGE_KEYS.DISTRICTS)) {
      localStorage.setItem(
        STORAGE_KEYS.DISTRICTS,
        JSON.stringify(DISTRICTS)
      );
    }
  }

  // --- Complaints CRUD ---
  static async getComplaints(): Promise<Complaint[]> {
    this.initLocalData();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((item) => ({
            id: item.id,
            issue: item.issue,
            category: item.category,
            district: item.district,
            locality: item.locality,
            pinCode: item.pin_code,
            landmark: item.landmark,
            latitude: item.latitude != null ? Number(item.latitude) : undefined,
            longitude: item.longitude != null ? Number(item.longitude) : undefined,
            date: item.date,
            status: item.status,
            description: item.description,
            related: item.related_count ?? 1,
            similar: item.similar_count ?? 0,
            citizenName: item.citizen_name,
            citizenMobile: item.citizen_mobile,
            citizenEmail: item.citizen_email,
            citizenDistrict: item.citizen_district,
            citizenLocality: item.citizen_locality,
            citizenPin: item.citizen_pin,
            evidenceFiles: item.evidence_files,
            voiceNote: item.voice_note,
            voiceAudioUrl: item.voice_audio_url,
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to local storage', err);
      }
    }

    const local = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    return local ? JSON.parse(local) : INITIAL_COMPLAINTS;
  }

  static async getComplaintById(id: string): Promise<Complaint | null> {
    const list = await this.getComplaints();
    return list.find((c) => c.id === id) || null;
  }

  static async createComplaint(
    data: Omit<Complaint, 'id' | 'date' | 'status' | 'related' | 'similar'> & {
      status?: ComplaintStatus;
    }
  ): Promise<Complaint> {
    this.initLocalData();
    const existing = await this.getComplaints();
    const nextNum = 4822 + existing.length;
    const newId = `CIV-2026-00${nextNum}`;
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newComplaint: Complaint = {
      id: newId,
      issue: data.issue,
      category: data.category,
      district: data.district,
      locality: data.locality,
      pinCode: data.pinCode || '110007',
      landmark: data.landmark || '',
      latitude: data.latitude,
      longitude: data.longitude,
      date: dateStr,
      status: data.status || 'Under Review',
      description: data.description,
      related: Math.floor(Math.random() * 80) + 120,
      similar: Math.floor(Math.random() * 40) + 40,
      citizenName: data.citizenName || 'Aarav Sharma',
      citizenMobile: data.citizenMobile || '+91 98123 45678',
      citizenEmail: data.citizenEmail || 'aarav.sharma@example.in',
      citizenDistrict: data.citizenDistrict || 'North Delhi',
      citizenLocality: data.citizenLocality || 'Civil Lines',
      citizenPin: data.citizenPin || '110054',
      evidenceFiles: data.evidenceFiles || [],
      voiceNote: data.voiceNote || false,
      voiceAudioUrl: data.voiceAudioUrl,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('complaints').insert({
          id: newComplaint.id,
          issue: newComplaint.issue,
          category: newComplaint.category,
          district: newComplaint.district,
          locality: newComplaint.locality,
          pin_code: newComplaint.pinCode,
          landmark: newComplaint.landmark,
          latitude: newComplaint.latitude,
          longitude: newComplaint.longitude,
          date: newComplaint.date,
          status: newComplaint.status,
          description: newComplaint.description,
          related_count: newComplaint.related,
          similar_count: newComplaint.similar,
          citizen_name: newComplaint.citizenName,
          citizen_mobile: newComplaint.citizenMobile,
          citizen_email: newComplaint.citizenEmail,
          citizen_district: newComplaint.citizenDistrict,
          citizen_locality: newComplaint.citizenLocality,
          citizen_pin: newComplaint.citizenPin,
          evidence_files: newComplaint.evidenceFiles,
          voice_note: newComplaint.voiceNote,
          voice_audio_url: newComplaint.voiceAudioUrl,
        });
      } catch (err) {
        console.warn('Supabase insert failed, saving locally', err);
      }
    }

    // Always update local storage
    const updated = [newComplaint, ...existing];
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));

    // Also update district report count
    this.incrementDistrictReport(newComplaint.district as DistrictName);

    notifyChange();
    return newComplaint;
  }

  static async updateComplaintStatus(
    id: string,
    status: ComplaintStatus
  ): Promise<boolean> {
    this.initLocalData();
    const list = await this.getComplaints();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    list[idx].status = status;
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('complaints')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase update failed', err);
      }
    }

    notifyChange();
    return true;
  }

  static async deleteComplaint(id: string): Promise<boolean> {
    this.initLocalData();
    const list = await this.getComplaints();
    const filtered = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(filtered));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('complaints').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete failed', err);
      }
    }

    notifyChange();
    return true;
  }

  // --- District Data ---
  static getDistricts(): Record<DistrictName, DistrictData> {
    this.initLocalData();
    const local = localStorage.getItem(STORAGE_KEYS.DISTRICTS);
    return local ? JSON.parse(local) : DISTRICTS;
  }

  private static incrementDistrictReport(district: DistrictName) {
    const districts = this.getDistricts();
    if (districts[district]) {
      districts[district].reports += 1;
      localStorage.setItem(STORAGE_KEYS.DISTRICTS, JSON.stringify(districts));
    }
  }

  // --- Notices ---
  static async getNotices(): Promise<NoticeItem[]> {
    this.initLocalData();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('notices')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase notices fetch failed', err);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.NOTICES);
    return local ? JSON.parse(local) : INITIAL_NOTICES;
  }

  static async createNotice(notice: Omit<NoticeItem, 'id'>): Promise<NoticeItem> {
    this.initLocalData();
    const newItem: NoticeItem = {
      ...notice,
      id: `notice-${Date.now()}`,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('notices').insert(newItem);
      } catch (err) {
        console.warn('Supabase insert notice failed', err);
      }
    }

    const notices = await this.getNotices();
    const updated = [newItem, ...notices];
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(updated));
    notifyChange();
    return newItem;
  }

  // --- Aggregated Stats ---
  static async getConsolidatedStats() {
    const complaints = await this.getComplaints();
    const districts = this.getDistricts();
    const totalReports = Object.values(districts).reduce(
      (sum, d) => sum + d.reports,
      0
    ) + (complaints.length - INITIAL_COMPLAINTS.length);

    const totalGaps = Object.values(districts).reduce((sum, d) => sum + d.gaps, 0);
    const totalProjects = Object.values(districts).reduce(
      (sum, d) => sum + d.projects,
      0
    );

    return {
      reports: totalReports.toLocaleString('en-IN'),
      gaps: totalGaps,
      projects: totalProjects,
      affected: '6.25L',
      monitoredDistricts: 3,
    };
  }

  // --- File Upload ---
  static async uploadFile(file: File): Promise<{ url: string; name: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error } = await supabase.storage
          .from('evidence')
          .upload(fileName, file);

        if (!error) {
          const { data } = supabase.storage
            .from('evidence')
            .getPublicUrl(fileName);
          return { url: data.publicUrl, name: file.name };
        }
      } catch (err) {
        console.warn('Supabase upload failed, falling back to Data URL', err);
      }
    }

    // Client-side Data URL conversion
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ url: reader.result as string, name: file.name });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // --- User Authentication / Profile ---
  static getCurrentUser(): UserProfile | null {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  static setCurrentUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    notifyChange();
  }

  static async login(
    email: string,
    role: 'citizen' | 'official' = 'citizen',
    fullName?: string
  ): Promise<UserProfile> {
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      fullName: fullName || (role === 'official' ? 'Officer Rajesh Sharma' : 'Aarav Sharma'),
      email,
      role,
      district: 'North Delhi',
      locality: 'Civil Lines',
      pinCode: '110054',
      mobile: '+91 98123 45678',
    };
    this.setCurrentUser(user);
    return user;
  }

  static logout() {
    this.setCurrentUser(null);
  }
}
