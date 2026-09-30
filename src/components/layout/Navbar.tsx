import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { DataService, subscribeToDataChanges } from '../../services/dataService';
import { UserProfile } from '../../types';
import {
  Building2,
  Menu,
  X,
  ChevronRight,
  User,
  LogOut,
  Landmark,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const CITIZEN_LINKS: [string, string][] = [
  ['Home', '/'],
  ['Register a Complaint', '/register-complaint'],
  ['My Complaints', '/my-complaints'],
  ['My District', '/my-district'],
  ['Demand Map', '/demand-map'],
  ['Development Insights', '/development-insights'],
  ['Notices / Updates', '/notices'],
  ['About / How It Works', '/about'],
];

export const GOVERNMENT_LINKS: [string, string][] = [
  ['Government Dashboard', '/government'],
  ['District Overview', '/government/district-overview'],
  ['Demand Hotspots', '/government/demand-hotspots'],
  ['Infrastructure Gaps', '/government/infrastructure-gaps'],
  ['Development Priorities', '/government/development-priorities'],
  ['Projects & Investment', '/government/projects-investment'],
  ['Impact / Action Tracking', '/government/impact-tracking'],
];

interface NavbarProps {
  onOpenAuth: (role?: 'citizen' | 'official') => void;
  language?: 'English' | 'हिन्दी';
  onToggleLanguage?: () => void;
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(DataService.getCurrentUser());
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const citizenLinks = [
    { label: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home', href: '/' },
    { label: language === 'hi' ? 'शिकायत दर्ज करें' : 'Register a Complaint', href: '/register-complaint' },
    { label: language === 'hi' ? 'मेरी शिकायतें' : 'My Complaints', href: '/my-complaints' },
    { label: language === 'hi' ? 'मेरा जिला' : 'My District', href: '/my-district' },
    { label: language === 'hi' ? 'मांग मानचित्र' : 'Demand Map', href: '/demand-map' },
    { label: language === 'hi' ? 'विकास रिपोर्ट' : 'Development Insights', href: '/development-insights' },
    { label: language === 'hi' ? 'जन सूचनाएं' : 'Notices / Updates', href: '/notices' },
    { label: language === 'hi' ? 'हमारे बारे में' : 'About / How It Works', href: '/about' },
  ];

  const govLinks = [
    { label: language === 'hi' ? 'सरकारी डैशबोर्ड' : 'Government Dashboard', href: '/government' },
    { label: language === 'hi' ? 'जिला स्थिति' : 'District Overview', href: '/government/district-overview' },
    { label: language === 'hi' ? 'मांग हॉटस्पॉट' : 'Demand Hotspots', href: '/government/demand-hotspots' },
    { label: language === 'hi' ? 'अवसंरचना अभाव' : 'Infrastructure Gaps', href: '/government/infrastructure-gaps' },
    { label: language === 'hi' ? 'विकास प्राथमिकताएं' : 'Development Priorities', href: '/government/development-priorities' },
    { label: language === 'hi' ? 'परियोजनाएं और बजट' : 'Projects & Investment', href: '/government/projects-investment' },
    { label: language === 'hi' ? 'प्रभाव ट्रैकिंग' : 'Impact / Action Tracking', href: '/government/impact-tracking' },
  ];

  useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setUser(DataService.getCurrentUser());
    });
    return unsub;
  }, []);

  const handleLogout = () => {
    DataService.logout();
    setUser(null);
  };

  return (
    <>
      {/* Top Notice Bar */}
      <Link
        to="/notices"
        className="flex min-h-8 items-center justify-center gap-2 border-b border-border bg-surface px-4 py-1.5 text-center text-[11px] text-muted-foreground transition hover:text-foreground sm:text-xs"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-ping" />
        <span>
          <b className="font-semibold text-foreground">
            {language === 'hi' ? 'सूचना' : 'NOTICE'}
          </b> · {t('topNotice')}{' '}
          <span className="text-secondary hover:underline">{t('viewUpdates')}</span>
        </span>
      </Link>

      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold sm:text-base">
                {t('appName')}
              </span>
              <span className="hidden text-[10px] text-muted-foreground sm:block">
                {t('appTagline')}
              </span>
            </span>
          </Link>

          {/* Right Header Navigation */}
          <div className="hidden items-center gap-2.5 lg:flex">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground border border-border bg-surface hover:bg-accent rounded-md transition cursor-pointer"
              title="Switch Language / भाषा बदलें"
            >
              <Languages className="size-3.5 text-primary" />
              <span>{language === 'en' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground">
                  <User className="size-3.5 text-primary" />
                  <span className="max-w-[120px] truncate font-medium">{user.fullName}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">({user.role})</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  title="Logout"
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenAuth('citizen')}
              >
                {language === 'hi' ? 'नागरिक लॉगिन' : 'Citizen Login'}
              </Button>
            )}

            <Button asChild size="sm">
              <Link to="/government">
                <Landmark className="size-4" />
                {language === 'hi' ? 'सरकारी नीति क्षेत्र' : 'Policy Access'}
              </Link>
            </Button>

            <Button asChild variant="secondary" size="sm">
              <Link to="/register-complaint">
                {language === 'hi' ? 'शिकायत दर्ज करें' : 'Report Issue'}
              </Link>
            </Button>

            {/* Dark/Light Mode Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="h-9 gap-1.5 px-3 text-xs font-semibold border-border bg-surface/50 hover:bg-surface text-foreground"
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="size-4 text-amber-400" />
                  <span className="hidden xl:inline">{language === 'hi' ? 'लाइट' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="size-4 text-secondary" />
                  <span className="hidden xl:inline">{language === 'hi' ? 'डार्क' : 'Dark'}</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setNavOpen(!navOpen)}
              aria-label="Toggle navigation menu"
            >
              {navOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border bg-surface rounded-md"
            >
              <Languages className="size-3.5 text-primary" />
              <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="size-9 border-border bg-surface text-foreground"
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4 text-secondary" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setNavOpen(!navOpen)}
              aria-label="Toggle navigation menu"
            >
              {navOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Dropdown Menu Overlay */}
        {navOpen && (
          <div className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-6 md:grid-cols-2">
              {/* Citizen Services */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  {language === 'hi' ? 'नागरिक सेवाएं' : 'Citizen Services'}
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {citizenLinks.map(({ label, href }) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setNavOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground',
                        location.pathname === href && 'bg-primary/10 text-primary font-medium'
                      )}
                    >
                      <span>{label}</span>
                      <ChevronRight className="size-3.5 opacity-60" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Government / Policy Area */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                  {language === 'hi' ? 'सरकारी नीति कार्यक्षेत्र' : 'Evidence for Policy (Government)'}
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {govLinks.map(({ label, href }) => (
                    <Link
                      key={href}
                      to={href}
                      onClick={() => setNavOpen(false)}
                      className={cn(
                        'flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground',
                        location.pathname === href && 'bg-secondary/10 text-secondary font-medium'
                      )}
                    >
                      <span>{label}</span>
                      <ChevronRight className="size-3.5 opacity-60" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile login footer */}
            <div className="border-t border-border px-5 py-3 lg:hidden flex flex-wrap justify-between items-center gap-3 bg-background/50">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Languages className="size-3.5 text-primary" />
                  <span>{language === 'en' ? '🇮🇳 हिन्दी में देखें' : '🇬🇧 Switch to English'}</span>
                </button>
              </div>
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-foreground">{user.fullName}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => { setNavOpen(false); onOpenAuth('citizen'); }}>
                  {language === 'hi' ? 'नागरिक लॉगिन' : 'Citizen Sign In'}
                </Button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export function Footer() {
  const { language } = useLanguage();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {language === 'hi'
            ? '© 2026 नागरिक अवसंरचना आसूचना प्रणाली (दिल्ली एनसीआर)'
            : '© 2026 Civic Infrastructure Intelligence (Delhi NCR)'}
        </span>
        <span>
          {language === 'hi'
            ? 'नीति समीक्षा के लिए सलाहकार आसूचना प्रणाली — स्वचालित निर्णय नहीं।'
            : 'Advisory intelligence for human policy review — not automated decision-making.'}
        </span>
      </div>
    </footer>
  );
}
