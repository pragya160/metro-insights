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
  ShieldAlert,
  User,
  LogOut,
  Landmark,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  language: 'English' | 'हिन्दी';
  onToggleLanguage: () => void;
}

export function Navbar({ onOpenAuth, language, onToggleLanguage }: NavbarProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(DataService.getCurrentUser());
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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
          <b className="font-semibold text-foreground">NOTICE</b> · New infrastructure development
          guidelines · 3 Delhi districts currently monitored ·{' '}
          <span className="text-secondary hover:underline">View latest updates →</span>
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
                Civic Infrastructure Intelligence
              </span>
              <span className="hidden text-[10px] text-muted-foreground sm:block">
                Citizen Demand • Infrastructure • Development
              </span>
            </span>
          </Link>

          {/* Right Header Navigation */}
          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={onToggleLanguage}
              className="px-3 py-2 text-xs text-muted-foreground transition hover:text-foreground cursor-pointer rounded-md hover:bg-surface"
            >
              {language} / हिन्दी
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
                Citizen Login
              </Button>
            )}

            <Button asChild size="sm">
              <Link to="/government">
                <Landmark className="size-4" />
                Policy Access
              </Link>
            </Button>

            {/* Dark / Light Mode Toggle Button */}
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
                  <span className="hidden xl:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="size-4 text-secondary" />
                  <span className="hidden xl:inline">Dark Mode</span>
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

          {/* Mobile Right Controls: Theme Toggle & Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
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
                  Citizen Services
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {CITIZEN_LINKS.map(([label, href]) => (
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

              {/* Government & Policy */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                    Government & Policy
                  </p>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ShieldAlert className="size-3 text-secondary" />
                    Restricted Workspace
                  </span>
                </div>
                <div className="grid gap-1 sm:grid-cols-2">
                  {GOVERNMENT_LINKS.map(([label, href]) => (
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
                  onClick={onToggleLanguage}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Language: {language} / हिन्दी
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="size-3 text-amber-400" />
                      <span>Light Theme</span>
                    </>
                  ) : (
                    <>
                      <Moon className="size-3 text-secondary" />
                      <span>Dark Theme</span>
                    </>
                  )}
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
                  Citizen Sign In
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
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Prototype • Fictional demonstration data • Delhi, India</span>
        <span>
          Advisory intelligence for human policy review — not automated decision-making.
        </span>
      </div>
    </footer>
  );
}
