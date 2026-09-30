import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { DataService } from '../../services/dataService';
import { X, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'citizen' | 'official';
}

export function AuthModal({ isOpen, onClose, defaultRole = 'citizen' }: AuthModalProps) {
  const [role, setRole] = useState<'citizen' | 'official'>(defaultRole);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please provide an email address');
      return;
    }

    setLoading(true);
    try {
      await DataService.login(
        email,
        role,
        fullName || (role === 'official' ? 'Policy Officer' : 'Citizen Resident')
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition hover:text-foreground cursor-pointer"
        >
          <X className="size-5" />
        </button>

        <div className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            {role === 'official' ? <ShieldCheck className="size-6" /> : <UserCheck className="size-6" />}
          </span>
          <h2 className="mt-4 text-xl font-bold">
            {role === 'official' ? 'Policy & Department Access' : isRegister ? 'Register Citizen Account' : 'Citizen Login'}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {role === 'official'
              ? 'Access district policy intelligence and review signals.'
              : 'Submit, track and view evidence for your neighborhood.'}
          </p>
        </div>

        {/* Role switcher */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => setRole('citizen')}
            className={`rounded-md py-1.5 text-xs font-semibold transition cursor-pointer ${
              role === 'citizen' ? 'bg-surface text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Citizen
          </button>
          <button
            type="button"
            onClick={() => setRole('official')}
            className={`rounded-md py-1.5 text-xs font-semibold transition cursor-pointer ${
              role === 'official' ? 'bg-surface text-secondary shadow' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Official / Policy
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {role === 'official' ? 'Official / Gov Email' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'official' ? 'officer@delhi.gov.in' : 'name@example.in'}
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : role === 'official' ? 'Authorize Access' : 'Sign In'}
          </Button>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="hover:underline text-secondary cursor-pointer"
            >
              {isRegister ? 'Already registered? Sign in' : 'New citizen? Create account'}
            </button>
            <span className="text-[10px] text-muted-foreground">Prototype demo auth</span>
          </div>
        </form>
      </div>
    </div>
  );
}
