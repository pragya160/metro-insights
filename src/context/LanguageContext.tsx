import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const translations: Translations = {
  // Brand & Nav
  appName: {
    en: 'Civic Infrastructure Intelligence',
    hi: 'नागरिक अवसंरचना आसूचना प्रणाली (दिल्ली)',
  },
  appTagline: {
    en: 'Citizen Demand • Infrastructure • Development',
    hi: 'नागरिक मांग • बुनियादी ढांचा • विकास निगरानी',
  },
  topNotice: {
    en: 'New infrastructure development guidelines · 3 Delhi districts currently monitored ·',
    hi: 'नए बुनियादी ढांचा विकास दिशानिर्देश · दिल्ली के 3 जिलों की सक्रिय निगरानी ·',
  },
  viewUpdates: {
    en: 'View latest updates →',
    hi: 'नवीनतम अपडेट देखें →',
  },
  navCitizenPortal: {
    en: 'Citizen Portal',
    hi: 'नागरिक सेवा केंद्र',
  },
  navGovernmentWorkspace: {
    en: 'Government / Policy',
    hi: 'सरकारी नीति कार्यक्षेत्र',
  },
  navHome: {
    en: 'Home',
    hi: 'मुख्य पृष्ठ',
  },
  navRegisterComplaint: {
    en: 'Register Issue',
    hi: 'शिकायत दर्ज करें',
  },
  navMyComplaints: {
    en: 'My Complaints',
    hi: 'मेरी शिकायतें',
  },
  navMyDistrict: {
    en: 'My District',
    hi: 'मेरा जिला',
  },
  navDemandMap: {
    en: 'Demand Map',
    hi: 'मांग मानचित्र',
  },
  navDevelopmentInsights: {
    en: 'Insights',
    hi: 'विकास रिपोर्ट',
  },
  navNotices: {
    en: 'Notices',
    hi: 'जन सूचनाएं',
  },
  navAbout: {
    en: 'About',
    hi: 'हमारे बारे में',
  },
  navPolicyOverview: {
    en: 'Policy Overview',
    hi: 'नीति समीक्षा',
  },
  navHotspots: {
    en: 'Demand Hotspots',
    hi: 'मांग हॉटस्पॉट',
  },
  navGaps: {
    en: 'Infrastructure Gaps',
    hi: 'अवसंरचना अभाव',
  },
  navPriorities: {
    en: 'Development Priorities',
    hi: 'विकास प्राथमिकताएं',
  },
  navProjects: {
    en: 'Projects & Investment',
    hi: 'परियोजनाएं और बजट',
  },
  navImpact: {
    en: 'Impact Tracking',
    hi: 'प्रभाव ट्रैकिंग',
  },
  signIn: {
    en: 'Sign In',
    hi: 'लॉग इन करें',
  },
  logout: {
    en: 'Logout',
    hi: 'लॉग आउट',
  },
  toggleTheme: {
    en: 'Toggle Theme',
    hi: 'थीम बदलें',
  },
  switchLanguage: {
    en: 'हिन्दी',
    hi: 'English',
  },
  currentLangLabel: {
    en: '🇮🇳 हिन्दी में देखें',
    hi: '🇬🇧 Switch to English',
  },

  // Hero Section
  heroEyebrow: {
    en: 'Delhi Civic Intelligence & Redressal',
    hi: 'दिल्ली नागरिक अवसंरचना व जन शिकायत निवारण',
  },
  heroTitle: {
    en: 'Bridging Citizen Demand with Municipal Infrastructure Action',
    hi: 'नागरिक शिकायतों को नगर निगम विकास कार्यों से सीधे जोड़ना',
  },
  heroSubtitle: {
    en: 'An evidence-led platform connecting resident grievances, geo-tagged infrastructure deficits, and municipal capital allocation across Delhi NCR.',
    hi: 'दिल्ली एनसीआर में नागरिकों की शिकायतों, भू-टैग किए गए बुनियादी ढांचे के अभावों और नगर निगम बजट आवंटन को जोड़ने वाला एकीकृत मंच।',
  },
  heroReportBtn: {
    en: 'Report a Civic Issue',
    hi: 'नागरिक समस्या की रिपोर्ट करें',
  },
  heroExploreBtn: {
    en: 'Explore District Status',
    hi: 'जिले की स्थिति देखें',
  },

  // Citizen Services
  citizenServicesHeading: {
    en: 'Citizen Redressal & Civic Services',
    hi: 'नागरिक शिकायत निवारण और सेवाएं',
  },
  serviceRegisterTitle: {
    en: 'Register a Complaint',
    hi: 'शिकायत दर्ज करें',
  },
  serviceRegisterDesc: {
    en: 'Report a local infrastructure issue with interactive location picker and live camera evidence.',
    hi: 'स्थान पिकर और लाइव कैमरा साक्ष्य के साथ स्थानीय बुनियादी ढांचे की समस्या दर्ज करें।',
  },
  serviceRegisterBtn: {
    en: 'Report an Issue',
    hi: 'समस्या दर्ज करें',
  },
  serviceMyComplaintsTitle: {
    en: 'My Complaints',
    hi: 'मेरी शिकायतें',
  },
  serviceMyComplaintsDesc: {
    en: 'Track reports you have submitted and view real-time department resolution progress.',
    hi: 'अपनी दर्ज शिकायतों की वास्तविक समय में विभाग द्वारा समाधान प्रगति ट्रैक करें।',
  },
  serviceMyComplaintsBtn: {
    en: 'View Complaints',
    hi: 'शिकायतें देखें',
  },
  serviceMyDistrictTitle: {
    en: 'My District',
    hi: 'मेरा जिला स्थिति',
  },
  serviceMyDistrictDesc: {
    en: 'Explore citizen concerns, infrastructure gaps and public works in your local ward.',
    hi: 'अपने वार्ड में नागरिक समस्याओं, बुनियादी ढांचे के अभाव और सार्वजनिक कार्यों को देखें।',
  },
  serviceMyDistrictBtn: {
    en: 'Explore District',
    hi: 'जिला अन्वेषण',
  },
  serviceInsightsTitle: {
    en: 'Development Insights',
    hi: 'विकास रिपोर्ट व संकेतक',
  },
  serviceInsightsDesc: {
    en: 'See how citizen demand and infrastructure data shape government priority signals.',
    hi: 'देखें कि कैसे नागरिक मांग और बुनियादी ढांचे का डेटा सरकारी प्राथमिकताओं को आकार देता है।',
  },
  serviceInsightsBtn: {
    en: 'View Insights',
    hi: 'रिपोर्ट देखें',
  },

  // Map & Live Stats
  liveMapTitle: {
    en: 'Delhi Civic Demand & Redressal Hotspots',
    hi: 'दिल्ली नागरिक मांग एवं शिकायत हॉटस्पॉट',
  },
  liveMapDesc: {
    en: 'Interactive GIS visualization across North, South and East Delhi municipal zones.',
    hi: 'उत्तर, दक्षिण और पूर्व दिल्ली नगर निगम क्षेत्रों में संवादात्मक जीआईएस मानचित्र।',
  },
  openFullMap: {
    en: 'Open Full Demand Map',
    hi: 'पूर्ण मांग मानचित्र खोलें',
  },
  statsComplaintsRegistered: {
    en: 'Complaints Registered',
    hi: 'कुल दर्ज शिकायतें',
  },
  statsResolvedRate: {
    en: 'Resolution Rate',
    hi: 'समाधान दर',
  },
  statsActiveProjects: {
    en: 'Active Projects',
    hi: 'सक्रिय सार्वजनिक कार्य',
  },
  statsMonitoredWards: {
    en: 'Wards Monitored',
    hi: 'निगरानी वाले वार्ड',
  },

  // Register Complaint Form
  formTitle: {
    en: 'Register a Civic Complaint',
    hi: 'नागरिक समस्या / शिकायत दर्ज करें',
  },
  formSubtitle: {
    en: 'Submit geo-tagged evidence to trigger municipal department review and field action.',
    hi: 'नगर निगम विभाग की समीक्षा और जमीनी कार्रवाई के लिए जियो-टैग किया गया साक्ष्य जमा करें।',
  },
  stepCategory: {
    en: 'Category',
    hi: 'श्रेणी',
  },
  stepLocation: {
    en: 'Location',
    hi: 'स्थान',
  },
  stepEvidence: {
    en: 'Evidence',
    hi: 'साक्ष्य (फोटो/ऑडियो)',
  },
  stepDetails: {
    en: 'Details',
    hi: 'विवरण',
  },
  stepReview: {
    en: 'Review & Submit',
    hi: 'समीक्षा और जमा करें',
  },

  catWaterSupply: {
    en: 'Water Supply & Contamination',
    hi: 'जल आपूर्ति और दूषित पानी',
  },
  catRoads: {
    en: 'Roads, Potholes & Footpaths',
    hi: 'सड़कें, गड्ढे और फुटपाथ',
  },
  catSanitation: {
    en: 'Sanitation & Waste Dumps',
    hi: 'स्वच्छता और कचरा प्रबंधन',
  },
  catLighting: {
    en: 'Street Lighting & Dark Spots',
    hi: 'स्ट्रीट लाइट और अंधेरे स्थान',
  },
  catDrainage: {
    en: 'Drainage & Waterlogging',
    hi: 'नाली और जलभराव',
  },
  catTraffic: {
    en: 'Traffic & Encroachment',
    hi: 'यातायात और अतिक्रमण',
  },

  locationInstruction: {
    en: 'Drag the pin or click anywhere on the map to pinpoint the exact issue location in Delhi.',
    hi: 'दिल्ली में समस्या के सटीक स्थान को इंगित करने के लिए मानचित्र पर पिन खींचें या क्लिक करें।',
  },
  selectedCoordinates: {
    en: 'Selected Coordinates',
    hi: 'चयनित निर्देशांक',
  },
  detectedLocality: {
    en: 'Detected Locality / Ward',
    hi: 'पहचाना गया क्षेत्र / वार्ड',
  },
  landmarkHelp: {
    en: 'Nearby Landmark or Street Reference',
    hi: 'निकटतम लैंडमार्क या सड़क का संदर्भ',
  },
  landmarkPlaceholder: {
    en: 'e.g. Near Metro Gate 3, opposite Community Hall',
    hi: 'उदा. मेट्रो गेट 3 के पास, कम्युनिटी हॉल के सामने',
  },

  evidenceCamera: {
    en: 'Open Live Camera Viewfinder',
    hi: 'लाइव कैमरा खोलें / फोटो खींचें',
  },
  evidenceUpload: {
    en: 'Upload Photo or Video',
    hi: 'फोटो या वीडियो अपलोड करें',
  },
  evidenceVoice: {
    en: 'Record Voice Note (Hindi / English)',
    hi: 'आवाज में विवरण रिकॉर्ड करें (हिन्दी / अंग्रेज़ी)',
  },

  issueTitleLabel: {
    en: 'Issue Title / Summary',
    hi: 'समस्या का शीर्षक / सारांश',
  },
  issueTitlePlaceholder: {
    en: 'e.g. Severe waterlogging near main market road',
    hi: 'उदा. मुख्य बाजार सड़क के पास भारी जलभराव',
  },
  issueDescLabel: {
    en: 'Detailed Description',
    hi: 'विस्तृत विवरण',
  },
  issueDescPlaceholder: {
    en: 'Describe the duration, severity, and how it impacts residents...',
    hi: 'समस्या कितने समय से है, इसकी गंभीरता और नागरिकों पर प्रभाव का विवरण दें...',
  },

  urgencyLabel: {
    en: 'Urgency Level',
    hi: 'आपातकालीन स्तर',
  },
  urgencyLow: {
    en: 'Low - General Maintenance',
    hi: 'सामान्य - सामान्य रखरखाव',
  },
  urgencyMedium: {
    en: 'Medium - Affects Daily Commute',
    hi: 'मध्यम - दैनिक आवागमन प्रभावित',
  },
  urgencyHigh: {
    en: 'High - Safety Hazard / Critical',
    hi: 'उच्च - गंभीर खतरा / तुरंत कार्रवाई जरूरी',
  },

  btnBack: {
    en: 'Back',
    hi: 'पीछे जाएं',
  },
  btnNext: {
    en: 'Next Step',
    hi: 'अगला चरण',
  },
  btnSubmitComplaint: {
    en: 'Submit Civic Complaint',
    hi: 'शिकायत दर्ज करें',
  },
  btnSubmitting: {
    en: 'Submitting to Municipal Portal...',
    hi: 'नगर निगम पोर्टल पर जमा हो रहा है...',
  },

  // My Complaints Page
  myComplaintsHeader: {
    en: 'My Submitted Grievances',
    hi: 'मेरी दर्ज नागरिक शिकायतें',
  },
  myComplaintsSubheader: {
    en: 'Track real-time progress, municipal agency assignments and field verification notes.',
    hi: 'वास्तविक समय में अपनी शिकायतों की प्रगति, आवंटित एजेंसी और सत्यापन विवरण ट्रैक करें।',
  },
  filterAll: {
    en: 'All Statuses',
    hi: 'सभी स्थितियां',
  },
  statusUnderReview: {
    en: 'Under Review',
    hi: 'समीक्षाधीन',
  },
  statusActionInitiated: {
    en: 'Action Initiated',
    hi: 'कार्रवाई शुरू',
  },
  statusResolved: {
    en: 'Resolved',
    hi: 'समाधान हो गया',
  },
  complaintIdCol: {
    en: 'Complaint ID',
    hi: 'शिकायत संख्या',
  },
  dateCol: {
    en: 'Date Filed',
    hi: 'दर्ज करने की तिथि',
  },
  agencyCol: {
    en: 'Assigned Department',
    hi: 'संबंधित विभाग',
  },
  actionCol: {
    en: 'Action',
    hi: 'विवरण',
  },
  noComplaintsFound: {
    en: 'No complaints found in this category.',
    hi: 'इस श्रेणी में कोई शिकायत नहीं मिली।',
  },

  // Government & Policy Workspace
  govEyebrow: {
    en: 'Municipal Policy & Evidence Workspace',
    hi: 'नगर निगम नीति और साक्ष्य कार्यक्षेत्र',
  },
  govTitle: {
    en: 'Evidence-Led Infrastructure Priorities',
    hi: 'साक्ष्य-आधारित अवसंरचना प्राथमिकताएं',
  },
  govSubtitle: {
    en: 'Connecting verified citizen distress signals with capital works budgets and ward-level repair schedules.',
    hi: 'नागरिक शिकायतों को सीधे पूंजीगत कार्य बजट और वार्ड-स्तरीय मरम्मत योजनाओं से जोड़ना।',
  },
  tabOverview: {
    en: 'District Overview',
    hi: 'जिला अवलोकन',
  },
  tabHotspots: {
    en: 'Hotspot Clusters',
    hi: 'हॉटस्पॉट क्लस्टर',
  },
  tabGaps: {
    en: 'Infrastructure Gaps',
    hi: 'बुनियादी ढांचा अभाव',
  },
  tabPriorities: {
    en: 'Priority Matrix',
    hi: 'प्राथमिकता मैट्रिक्स',
  },
  tabProjects: {
    en: 'Active Projects',
    hi: 'सक्रिय परियोजनाएं',
  },
  tabImpact: {
    en: 'Impact Tracking',
    hi: 'प्रभाव ट्रैकिंग',
  },

  // Notices
  noticesTitle: {
    en: 'Municipal Notices & Public Circulars',
    hi: 'नगर निगम जन सूचनाएं एवं परिपत्र',
  },
  noticesSubtitle: {
    en: 'Official announcements regarding road works, water schedules and seasonal maintenance.',
    hi: 'सड़क निर्माण, जलापूर्ति समय और मौसमी रखरखाव संबंधी आधिकारिक सूचनाएं।',
  },

  // Footer
  footerCopyright: {
    en: '© 2026 Delhi Civic Infrastructure Intelligence Platform. Evidence-led municipal governance.',
    hi: '© 2026 दिल्ली नागरिक अवसंरचना आसूचना प्रणाली। साक्ष्य-आधारित सुशासन।',
  },
  footerDisclaimer: {
    en: 'Designed for transparency, citizen participation, and data-backed civic improvement across Delhi NCR.',
    hi: 'दिल्ली एनसीआर में पारदर्शिता, नागरिक भागीदारी और डेटा-आधारित सुधार के लिए समर्पित।',
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('civic_app_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('civic_app_lang', next);
      return next;
    });
  };

  const setLanguage = (lang: Language) => {
    localStorage.setItem('civic_app_lang', lang);
    setLanguageState(lang);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = translations[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    if (fallback) return fallback;
    if (entry && entry.en) return entry.en;
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
