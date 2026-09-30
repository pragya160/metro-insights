import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
  Card,
  Badge,
  StatCard,
  PageHeader,
  SectionHeader,
  DisclaimerBanner,
} from '../../components/ui/CardsAndHeaders';
import { DataTable } from '../../components/ui/ChartsAndMaps';
import { InteractiveGoogleMap } from '../../components/map/InteractiveGoogleMap';
import { DISTRICTS, MAP_HOTSPOTS, PRIORITY_SIGNALS } from '../../data/demoData';
import { DataService, subscribeToDataChanges } from '../../services/dataService';
import { Complaint } from '../../types';
import { cn } from '../../lib/utils';
import {
  Download,
  ArrowUpRight,
  Flame,
  Radio,
  TrendingUp,
  Briefcase,
  GitCommit,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const GOV_NAV_ITEMS = [
  { label: 'Overview', to: '/government' },
  { label: 'District Overview', to: '/government/district-overview' },
  { label: 'Demand Hotspots', to: '/government/demand-hotspots' },
  { label: 'Infrastructure Gaps', to: '/government/infrastructure-gaps' },
  { label: 'Development Priorities', to: '/government/development-priorities' },
  { label: 'Projects & Investment', to: '/government/projects-investment' },
  { label: 'Impact Tracking', to: '/government/impact-tracking' },
];

export function GovernmentSubnav() {
  const location = useLocation();

  return (
    <div className="border-b border-border bg-surface/60">
      <div className="page-container flex items-center gap-1 overflow-x-auto py-2">
        <span className="mr-2 flex items-center gap-1.5 text-xs font-semibold text-secondary whitespace-nowrap">
          <ShieldCheck className="size-4" />
          Policy Workspace:
        </span>
        {GOV_NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'rounded-none border border-transparent px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition',
              location.pathname === item.to
                ? 'bg-primary text-primary-foreground font-semibold shadow border-primary'
                : 'text-muted-foreground hover:bg-surface hover:text-foreground hover:border-border'
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PrioritySignalBanner() {
  return (
    <Card className="border-l-2 border-l-secondary">
      <div className="flex gap-3">
        <Info className="size-5 shrink-0 text-secondary mt-0.5" />
        <div>
          <h3 className="font-bold text-base">How to read a Development Priority Signal</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            The signal combines citizen demand, infrastructure gap, affected population, severity,
            geographic concentration and existing development coverage. It provides evidence for policy
            review; accountable officials retain all decision-making authority.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ==========================================================================
   GOVERNMENT DASHBOARD PAGE (/government)
   ========================================================================== */
export function GovernmentDashboardPage() {
  const [stats, setStats] = useState({
    reports: '5,341',
    gaps: 32,
    projects: 22,
    affected: '6.25L',
  });
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    DataService.getConsolidatedStats().then(setStats);
    DataService.getComplaints().then(setComplaints);
    const unsub = subscribeToDataChanges(() => {
      DataService.getConsolidatedStats().then(setStats);
      DataService.getComplaints().then(setComplaints);
    });
    return unsub;
  }, []);

  return (
    <main>
      <PageHeader
        eyebrow="Government / Policy Workspace"
        title="Development Intelligence Dashboard"
        description="A consolidated evidence view connecting citizen demand, infrastructure gaps, affected population and existing project activity."
        action={
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="size-4" />
            Export briefing
          </Button>
        }
      />
      <GovernmentSubnav />

      <div className="page-container space-y-8 py-8">
        <DisclaimerBanner />

        {/* 4 Consolidated Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Citizen Reports"
            value={stats.reports}
            note="Across 3 monitored districts"
          />
          <StatCard
            label="Infrastructure Gaps"
            value={stats.gaps}
            note="Validated and emerging gaps"
          />
          <StatCard
            label="Active Projects"
            value={stats.projects}
            note="Across 4 sectors"
          />
          <StatCard
            label="Est. Population Affected"
            value={stats.affected}
            note="Aggregated planning estimate"
          />
        </div>

        {/* Map & Policy Review Queue */}
        <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <Card>
            <SectionHeader
              title="Delhi Demand Intelligence"
              subtitle="Aggregated district signals & field reports"
            />
            <InteractiveGoogleMap
              mode="explorer"
              complaints={complaints}
              heightClass="min-h-[380px] h-[420px]"
            />
          </Card>

          <Card>
            <SectionHeader
              title="Policy Review Queue"
              subtitle="Signals are advisory, not decisions"
            />
            <div className="space-y-3">
              {PRIORITY_SIGNALS.map((sig) => (
                <Link
                  key={sig.rank}
                  to="/government/development-priorities"
                  className="flex items-center gap-3 rounded-md border border-border p-3 transition hover:border-primary/40 hover:bg-accent/40"
                >
                  <span className="grid size-9 place-items-center rounded-md bg-primary/10 font-bold text-primary">
                    {sig.rank}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm">{sig.issue}</b>
                    <span className="text-xs text-muted-foreground">
                      {sig.district} · Signal {sig.signal}/100
                    </span>
                  </span>
                  <ArrowUpRight className="size-4 text-secondary" />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <PrioritySignalBanner />
      </div>
    </main>
  );
}

/* ==========================================================================
   DEMAND HOTSPOTS (/government/demand-hotspots)
   ========================================================================== */
export function DemandHotspotsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    DataService.getComplaints().then(setComplaints);
    const unsub = subscribeToDataChanges(() => {
      DataService.getComplaints().then(setComplaints);
    });
    return unsub;
  }, []);

  return (
    <main>
      <PageHeader
        eyebrow="Evidence for Policy Review"
        title="Demand Hotspots"
        description="Geographic concentrations of related citizen reports, interpreted alongside infrastructure and population evidence."
        action={
          <span className="grid size-11 place-items-center rounded-md border border-secondary/30 text-secondary">
            <Flame className="size-6" />
          </span>
        }
      />
      <GovernmentSubnav />

      <div className="page-container space-y-7 py-8">
        <DisclaimerBanner />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <InteractiveGoogleMap
            mode="explorer"
            complaints={complaints}
            hotspots={MAP_HOTSPOTS}
            heightClass="min-h-[460px] h-[520px]"
          />

          <div className="space-y-3">
            {MAP_HOTSPOTS.map((h) => (
              <Card key={h.district} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-secondary">
                    {h.district}
                  </p>
                  <h3 className="mt-1 font-bold text-base">{h.category}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {h.reports} related reports · {h.gap} gap · {h.affected} affected
                  </p>
                </div>
                <span className="text-2xl font-bold text-highlight">{h.score}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ==========================================================================
   INFRASTRUCTURE GAPS (/government/infrastructure-gaps)
   ========================================================================== */
export function InfrastructureGapsPage() {
  const allGaps = Object.entries(DISTRICTS).flatMap(([dName, dData]) =>
    dData.gapsList.map((g) => [dName, ...g])
  );

  return (
    <main>
      <PageHeader
        eyebrow="Evidence for Policy Review"
        title="Infrastructure Gaps"
        description="Evidence of missing, insufficient or unreliable public infrastructure across the monitored districts."
        action={
          <span className="grid size-11 place-items-center rounded-md border border-secondary/30 text-secondary">
            <Radio className="size-6" />
          </span>
        }
      />
      <GovernmentSubnav />

      <div className="page-container space-y-7 py-8">
        <DisclaimerBanner />

        <DataTable
          headers={['District', 'Sector', 'Gap', 'Location', 'Affected Population', 'Status']}
          rows={allGaps.map((g) => [
            g[0],
            g[1],
            g[2],
            g[3],
            g[4],
            <Badge key={g[2]}>{g[5]}</Badge>,
          ])}
        />
      </div>
    </main>
  );
}

/* ==========================================================================
   DEVELOPMENT PRIORITIES (/government/development-priorities)
   ========================================================================== */
export function DevelopmentPrioritiesPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Evidence for Policy Review"
        title="Development Priorities"
        description="Composite advisory signals for human policy review—not automated government decisions."
        action={
          <span className="grid size-11 place-items-center rounded-md border border-secondary/30 text-secondary">
            <TrendingUp className="size-6" />
          </span>
        }
      />
      <GovernmentSubnav />

      <div className="page-container space-y-7 py-8">
        <DisclaimerBanner />

        <div className="space-y-4">
          {PRIORITY_SIGNALS.map((sig) => (
            <Card key={sig.rank}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                <span className="grid size-12 place-items-center rounded-md border border-primary/30 bg-primary/10 text-xl font-bold text-primary">
                  {sig.rank}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[.12em] text-secondary font-semibold">
                    {sig.district}
                  </p>
                  <h3 className="mt-1 text-lg font-bold">{sig.issue}</h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-4">
                    <PriorityProgressBar label="Demand" value={sig.demand} />
                    <PriorityProgressBar label="Gap" value={sig.gap} />
                    <PriorityProgressBar label="Population" value={sig.population} />
                    <PriorityProgressBar label="Project Coverage" value={sig.coverage} />
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <p className="text-4xl font-bold text-highlight">{sig.signal}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Priority Signal</p>
                  <div className="mt-2">
                    <Badge>Suggested for Review</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <PrioritySignalBanner />
      </div>
    </main>
  );
}

function PriorityProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] uppercase text-muted-foreground">
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <div className="h-1.5 rounded-full bg-background overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/* ==========================================================================
   PROJECTS & INVESTMENT (/government/projects-investment)
   ========================================================================== */
export function ProjectsInvestmentPage() {
  const allProjects = Object.entries(DISTRICTS).flatMap(([dName, dData]) =>
    dData.projectsList.map((p) => [dName, ...p])
  );

  return (
    <main>
      <PageHeader
        eyebrow="Evidence for Policy Review"
        title="Projects & Investment"
        description="Active development coverage compared with the demand and gap evidence in each district."
        action={
          <span className="grid size-11 place-items-center rounded-md border border-secondary/30 text-secondary">
            <Briefcase className="size-6" />
          </span>
        }
      />
      <GovernmentSubnav />

      <div className="page-container space-y-7 py-8">
        <DisclaimerBanner />

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Active Projects" value="22" />
          <StatCard
            label="Indicative Investment"
            value="₹684 Cr"
            note="Fictional demo estimate"
          />
          <StatCard
            label="Gap Coverage"
            value="34%"
            note="Across monitored signals"
          />
        </div>

        <DataTable
          headers={['District', 'Project', 'Sector', 'Location', 'Status', 'Coverage']}
          rows={allProjects.map((p) => [
            p[0],
            p[1],
            p[2],
            p[3],
            <Badge key={p[1]}>{p[4]}</Badge>,
            p[5],
          ])}
        />
      </div>
    </main>
  );
}

/* ==========================================================================
   IMPACT / ACTION TRACKING (/government/impact-tracking)
   ========================================================================== */
export function ImpactTrackingPage() {
  const rows = [
    [
      'North Delhi',
      'Water pressure field validation',
      'Delhi Jal Board',
      'In progress',
      '18 Sep 2026',
    ],
    [
      'South Delhi',
      'Road safety package procurement',
      'PWD',
      'Action Initiated',
      '15 Sep 2026',
    ],
    [
      'East Delhi',
      'Drain capacity engineering survey',
      'Municipal Services',
      'Department Review',
      '12 Sep 2026',
    ],
    [
      'East Delhi',
      'Waste collection route redesign',
      'Municipal Services',
      'Completed',
      '08 Sep 2026',
    ],
  ];

  return (
    <main>
      <PageHeader
        eyebrow="Evidence for Policy Review"
        title="Impact / Action Tracking"
        description="Trace how evidence moves from citizen reporting to departmental review, action and measured outcomes."
        action={
          <span className="grid size-11 place-items-center rounded-md border border-secondary/30 text-secondary">
            <GitCommit className="size-6" />
          </span>
        }
      />
      <GovernmentSubnav />

      <div className="page-container space-y-7 py-8">
        <DisclaimerBanner />

        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Signals Reviewed" value="18" />
          <StatCard label="Actions Initiated" value="11" />
          <StatCard label="Projects Linked" value="9" />
          <StatCard label="Resolved Clusters" value="4" />
        </div>

        <DataTable
          headers={['District', 'Action', 'Agency', 'Stage', 'Last Update']}
          rows={rows.map((r) => [
            r[0],
            r[1],
            r[2],
            <Badge key={r[1]}>{r[3]}</Badge>,
            r[4],
          ])}
        />
      </div>
    </main>
  );
}
