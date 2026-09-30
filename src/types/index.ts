export type DistrictName = 'North Delhi' | 'South Delhi' | 'East Delhi';

export type CategoryName =
  | 'Water Supply'
  | 'Roads & Transport'
  | 'Waste & Sanitation'
  | 'Electricity & Digital Connectivity';

export type ComplaintStatus =
  | 'Submitted'
  | 'AI Classified'
  | 'Similar Reports Identified'
  | 'Department Review'
  | 'Action Initiated'
  | 'Resolved'
  | 'Under Review';

export interface CategoryInfo {
  name: CategoryName;
  short: string;
  icon: string;
  color: string;
  subissues: string[];
}

export interface GapItem {
  sector: string;
  gap: string;
  location: string;
  affected: string;
  status: string;
}

export interface ProjectItem {
  name: string;
  sector: string;
  location: string;
  status: string;
  coverage: string;
}

export interface DistrictData {
  reports: number;
  gaps: number;
  projects: number;
  affected: string;
  underAction: number;
  primary: CategoryName;
  localities: string[];
  breakdown: number[];
  trend: number[];
  narrative: string;
  gapsList: [string, string, string, string, string][];
  projectsList: [string, string, string, string, string][];
}

export interface Complaint {
  id: string;
  issue: string;
  category: CategoryName | string;
  district: DistrictName | string;
  locality: string;
  pinCode?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  date: string;
  status: ComplaintStatus;
  description: string;
  related: number;
  similar: number;
  subissue?: string;
  citizenName?: string;
  citizenMobile?: string;
  citizenEmail?: string;
  citizenDistrict?: DistrictName | string;
  citizenLocality?: string;
  citizenPin?: string;
  evidenceFiles?: string[];
  voiceNote?: boolean;
  voiceAudioUrl?: string;
}

export interface NoticeItem {
  id?: string;
  date: string;
  dept: string;
  title: string;
  text: string;
}

export interface MapHotspot {
  district: DistrictName;
  category: string;
  reports: number;
  gap: string;
  affected: string;
  coverage: string;
  score: number;
  x: number;
  y: number;
  lat: number;
  lng: number;
  locality?: string;
}

export interface PrioritySignalItem {
  rank: 'A' | 'B' | 'C' | string;
  district: DistrictName | string;
  issue: string;
  demand: number;
  gap: number;
  population: number;
  coverage: number;
  signal: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: 'citizen' | 'official' | 'admin';
  district: DistrictName | string;
  locality: string;
  pinCode: string;
}
