import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { Navbar, Footer } from './components/layout/Navbar';
import { AuthModal } from './components/layout/AuthModal';
import { GoogleMapsProvider } from './components/map/GoogleMapsProvider';

import { HomePage } from './pages/HomePage';
import {
  RegisterComplaintPage,
  ComplaintSubmittedPage,
} from './pages/RegisterComplaintPage';
import {
  MyComplaintsPage,
  ComplaintDetailsPage,
} from './pages/MyComplaintsPage';
import { DistrictExplorerPage } from './pages/DistrictExplorerPage';
import {
  DemandMapPage,
  DevelopmentInsightsPage,
  NoticesPage,
  AboutPage,
} from './pages/CitizenPages';

import {
  GovernmentDashboardPage,
  DemandHotspotsPage,
  InfrastructureGapsPage,
  DevelopmentPrioritiesPage,
  ProjectsInvestmentPage,
  ImpactTrackingPage,
} from './pages/government/GovernmentPages';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'citizen' | 'official'>('citizen');
  const [language, setLanguage] = useState<'English' | 'हिन्दी'>('English');
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  const handleOpenAuth = (role: 'citizen' | 'official' = 'citizen') => {
    setAuthRole(role);
    setAuthOpen(true);
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'English' ? 'हिन्दी' : 'English'));
  };

  return (
    <GoogleMapsProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
          {quotaExceeded && (
            <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
              <span>
                Google Maps Platform quota reached. If you are the app owner, visit{' '}
                <a
                  href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold text-amber-950 hover:text-amber-800"
                >
                  maps developer site
                </a>{' '}
                for instructions to update your account.
              </span>
            </div>
          )}

          <Navbar
            onOpenAuth={handleOpenAuth}
            language={language}
            onToggleLanguage={handleToggleLanguage}
          />

        <div className="flex-1">
          <Routes>
            {/* Citizen Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register-complaint" element={<RegisterComplaintPage />} />
            <Route path="/complaint-submitted" element={<ComplaintSubmittedPage />} />
            <Route path="/my-complaints" element={<MyComplaintsPage />} />
            <Route path="/complaints/:id" element={<ComplaintDetailsPage />} />
            <Route path="/my-district" element={<DistrictExplorerPage policy={false} />} />
            <Route path="/demand-map" element={<DemandMapPage />} />
            <Route path="/development-insights" element={<DevelopmentInsightsPage />} />
            <Route path="/notices" element={<NoticesPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Government / Policy Routes */}
            <Route path="/government" element={<GovernmentDashboardPage />} />
            <Route
              path="/government/district-overview"
              element={<DistrictExplorerPage policy={true} />}
            />
            <Route path="/government/demand-hotspots" element={<DemandHotspotsPage />} />
            <Route
              path="/government/infrastructure-gaps"
              element={<InfrastructureGapsPage />}
            />
            <Route
              path="/government/development-priorities"
              element={<DevelopmentPrioritiesPage />}
            />
            <Route
              path="/government/projects-investment"
              element={<ProjectsInvestmentPage />}
            />
            <Route
              path="/government/impact-tracking"
              element={<ImpactTrackingPage />}
            />

            {/* Fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>

        <Footer />

        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          defaultRole={authRole}
        />
      </div>
    </BrowserRouter>
  </GoogleMapsProvider>
);
}
