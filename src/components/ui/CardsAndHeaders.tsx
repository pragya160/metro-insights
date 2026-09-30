import React from 'react';
import { cn } from '../../lib/utils';

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-none border border-border bg-surface p-5 text-card-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ children }: { children: React.ReactNode }) {
  const str = String(children);
  const colorClass =
    str === 'Resolved' || str === 'Completed'
      ? 'border-primary/30 bg-primary/10 text-primary'
      : str.includes('Action') || str.includes('Progress') || str.includes('Initiated')
      ? 'border-secondary/30 bg-secondary/10 text-secondary'
      : 'border-highlight/20 bg-highlight/5 text-highlight';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none border px-2.5 py-1 text-[11px] font-semibold',
        colorClass
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-bold text-highlight">{value}</p>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </Card>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-surface/40">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-end md:justify-between md:py-10">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-3 border border-secondary/20 bg-secondary/5 px-4 py-3 text-xs text-muted-foreground rounded-md">
      <svg
        className="mt-0.5 size-4 shrink-0 text-secondary"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      <span>
        <b className="text-foreground">Hackathon prototype.</b> All reports, population estimates,
        projects and policy signals shown are fictional demonstration data.
      </span>
    </div>
  );
}
