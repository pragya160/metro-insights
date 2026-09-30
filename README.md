# Civic Infrastructure Intelligence (Delhi NCR)

> An evidence-led civic grievance redressal and public infrastructure intelligence platform bridging citizen reports with municipal governance priorities.

---

## 📌 Problem Statement
Municipal corporations and urban planning departments in high-density metropolitan areas like Delhi NCR receive thousands of fragmented citizen complaints across disjointed channels (helplines, social media, walk-ins). 

Key challenges:
1. **Lack of Geographic Precision**: Text-only complaints often lack pinpointed GPS coordinates, making field verification difficult.
2. **Missing Evidence & Accessibility Barriers**: Citizens struggle to describe technical issues without visual or voice evidence.
3. **Data Silos in Policy Decision-Making**: High volume of complaints in one ward rarely connects with municipal capital expenditure budgets or infrastructure repair scheduling.

---

## 💡 Solution Overview
**Civic Infrastructure Intelligence** transforms unstructured citizen feedback into actionable geospatial intelligence for municipal administrators:

- **Citizen Redressal Engine**: Multi-step complaint filing with interactive Google Maps coordinate pinning, reverse geocoding to Delhi wards/localities, live in-app camera capture, video attachments, and bilingual voice recording with speech-to-text transcription.
- **Geospatial Hotspot Clustering**: Aggregated visualization of civic distress signals across North, South, and East Delhi districts.
- **Municipal Policy Dashboard**: Decision-support workspace for government officials to evaluate infrastructure gaps, prioritize ward budgets, monitor contractor impact, and allocate resources based on verified community demand.
- **Dual Visual Themes**: Clean Light and Dark modes with high-contrast accessibility and crisp rectangular geometry.

---

## 🚀 Key Features

### 👤 Citizen Portal
- **Pinpoint Location Picker**: Interactive Google Maps integration with drag-and-drop marker positioning, GPS auto-detect, and landmark search across 18+ Delhi localities.
- **Live Camera & Media Capture**: Built-in webcam/mobile viewfinder allowing citizens to capture and attach photographic evidence directly on site.
- **Voice Note Transcription**: Speech-to-text recording supporting English & Hindi description inputs.
- **Category-Smart Guidance**: Dynamic prompts tailored to specific civic domains (Water Supply, Roads & Potholes, Sanitation, Street Lighting, Drainage).
- **Complaint Tracking**: Live status tracking (`Under Review` ➔ `Action Initiated` ➔ `Resolved`) with unique complaint IDs.

### 🏛️ Government & Municipal Workspace
- **Executive Policy Overview**: Real-time KPI analytics on active issues, high-priority hotspots, and verified citizen impact.
- **Infrastructure Gap Analysis**: Ward-by-ward deficit mapping across drainage, road networks, and clean water delivery.
- **Development Priorities Matrix**: Demand vs. severity scoring to aid municipal budget allocation.
- **Project & Contractor Tracking**: Timeline and budget monitoring for municipal public works.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Mapping & Geospatial**: `@vis.gl/react-google-maps` (Google Maps JavaScript API)
- **Database / Cloud**: Supabase (PostgreSQL & Storage) with offline-resilient local state fallback
- **Audio & Media**: Web Audio API, MediaDevices API (`getUserMedia`), Canvas API

---

## 📦 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/delhi-civic-intel.git

# 2. Navigate to project root
cd delhi-civic-intel

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000` to test the application.

---

## 🌐 Environment Variables (Optional)

Create a `.env` file in the project root if you wish to configure custom Google Maps or Supabase instances:

```env
# Google Maps API Key (Optional: App includes fallback demo key)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Supabase Credentials (Optional: App includes in-memory local state fallback)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🚢 Deployment Guide

### Deploying to Vercel (Recommended)
1. Push your code to GitHub.
2. Sign in to [Vercel](https://vercel.com) using your GitHub account.
3. Click **"New Project"** and import your `delhi-civic-intel` repository.
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**.

### Deploying to Netlify
1. Log in to [Netlify](https://www.netlify.com).
2. Click **"Add new site"** ➔ **"Import an existing project"** ➔ Choose GitHub.
3. Set Build command: `npm run build`
4. Set Publish directory: `dist`
5. Click **Deploy Site**.

---

## 👥 Hackathon Team
- **Frontend & UX**: Interactive Maps, Camera Viewfinder, Theme System
- **Geospatial & State Architecture**: Google Maps integration, Supabase data layer
- **Product & Municipal Workflow**: Redressal lifecycle, Policy analytics
