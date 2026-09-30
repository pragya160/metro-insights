import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import {
  Card,
  Badge,
  PageHeader,
  SectionHeader,
  DisclaimerBanner,
} from '../components/ui/CardsAndHeaders';
import { DistrictMap } from '../components/ui/ChartsAndMaps';
import { InteractiveGoogleMap } from '../components/map/InteractiveGoogleMap';
import {
  CATEGORIES,
  DISTRICTS,
  MAP_HOTSPOTS,
  PRIORITY_SIGNALS,
} from '../data/demoData';
import { DataService, subscribeToDataChanges } from '../services/dataService';
import { DistrictName, NoticeItem, Complaint } from '../types';
import {
  Megaphone,
  ArrowRight,
  Target,
  FileText,
  X,
  PlusCircle,
} from 'lucide-react';

/* ==========================================================================
   DEMAND MAP PAGE
   ========================================================================== */
export function DemandMapPage() {
  const [district, setDistrict] = useState<string>('All');
  const [category, setCategory] = useState<string>('All');
  const [period, setPeriod] = useState<string>('Last 90 days');
  const [severity, setSeverity] = useState<string>('All severities');
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    DataService.getComplaints().then(setComplaints);
    const unsub = subscribeToDataChanges(() => {
      DataService.getComplaints().then(setComplaints);
    });
    return unsub;
  }, []);

  const filtered = MAP_HOTSPOTS.filter(
    (h) =>
      (district === 'All' || h.district === district) &&
      (category === 'All' || h.category === category)
  );

  return (
    <main>
      <PageHeader
        eyebrow="Geographic Intelligence"
        title="Demand Map"
        description="Explore aggregated demand clusters. Individual citizen locations are not displayed."
      />

      <div className="page-container py-8 space-y-6">
        <DisclaimerBanner />

        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-muted-foreground font-medium">
            District
            <select
              className="mt-2 h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="All">All</option>
              {Object.keys(DISTRICTS).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-muted-foreground font-medium">
            Category
            <select
              className="mt-2 h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All</option>
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-muted-foreground font-medium">
            Time Period
            <select
              className="mt-2 h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>2026 YTD</option>
            </select>
          </label>

          <label className="text-xs text-muted-foreground font-medium">
            Severity
            <select
              className="mt-2 h-10 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option>All severities</option>
              <option>High</option>
              <option>Moderate</option>
            </select>
          </label>
        </div>

        {/* Map & Clusters Grid */}
        <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
          <InteractiveGoogleMap
            mode="explorer"
            selectedDistrict={district}
            selectedCategory={category}
            complaints={complaints}
            hotspots={filtered}
            heightClass="min-h-[500px] h-[580px]"
          />

          <div className="space-y-3">
            {filtered.map((item) => (
              <Card key={item.district}>
                <p className="text-xs uppercase tracking-[.12em] text-secondary font-semibold">
                  {item.district}
                </p>
                <h2 className="mt-1 font-bold text-base">{item.category}</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {item.reports} related reports
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.gap} Infrastructure Gap
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Est. affected: {item.affected}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs">Development Priority Signal</span>
                  <b className="text-2xl text-highlight">{item.score}</b>
                </div>
              </Card>
            ))}

            {filtered.length === 0 && (
              <Card className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No matching aggregated clusters in this demo dataset.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ==========================================================================
   DEVELOPMENT INSIGHTS PAGE
   ========================================================================== */
export function DevelopmentInsightsPage() {
  const signalDrivers = [
    'Citizen demand',
    'Infrastructure gap',
    'Affected population',
    'Severity',
    'Geographic concentration',
    'Existing project activity',
  ];

  return (
    <main>
      <PageHeader
        eyebrow="Public Intelligence"
        title="Development Insights"
        description="Understand how citizen demand combines with infrastructure and development evidence to support policy review."
      />

      <div className="page-container space-y-8 py-8">
        <DisclaimerBanner />

        {/* Signal Rank Cards */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PRIORITY_SIGNALS.map((sig) => (
            <Card key={sig.rank}>
              <p className="text-xs uppercase tracking-[.12em] text-secondary font-semibold">
                {sig.district}
              </p>
              <h2 className="mt-2 font-bold text-base">{sig.issue}</h2>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-highlight">{sig.signal}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">
                    Development Priority Signal
                  </p>
                </div>
                <Badge>Suggested for Review</Badge>
              </div>
            </Card>
          ))}
        </section>

        {/* What shapes the signal */}
        <Card>
          <SectionHeader
            title="What shapes the signal?"
            subtitle="Complaint volume is one input—not the conclusion."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {signalDrivers.map((driver, idx) => (
              <div key={driver} className="flex gap-3 border-l border-primary/40 pl-4 py-1">
                <span className="text-sm font-bold text-primary">0{idx + 1}</span>
                <p className="text-sm font-medium">{driver}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}

/* ==========================================================================
   NOTICES / UPDATES PAGE
   ========================================================================== */
export function NoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('Department of Urban Development');
  const [newText, setNewText] = useState('');

  useEffect(() => {
    DataService.getNotices().then(setNotices);
    const unsub = subscribeToDataChanges(() => {
      DataService.getNotices().then(setNotices);
    });
    return unsub;
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newText) return;
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    await DataService.createNotice({
      date: today,
      dept: newDept,
      title: newTitle,
      text: newText,
    });
    setShowAddModal(false);
    setNewTitle('');
    setNewText('');
  };

  return (
    <main>
      <PageHeader
        eyebrow="Public Information"
        title="Notices / Updates"
        description="Latest fictional departmental updates for this hackathon demonstration."
        action={
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
            <PlusCircle className="size-4" />
            Publish Notice
          </Button>
        }
      />

      <div className="page-container space-y-4 py-8">
        <DisclaimerBanner />

        {notices.map((n) => (
          <Card key={n.title} className="transition hover:border-primary/40">
            <div className="flex gap-4">
              <Megaphone className="mt-1 size-5 shrink-0 text-secondary" />
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[.1em] text-secondary font-semibold">
                  {n.date} · {n.dept}
                </p>
                <h2 className="mt-2 text-lg font-bold text-foreground">{n.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{n.text}</p>
                <Button
                  variant="link"
                  className="mt-3 inline-flex items-center gap-1 font-semibold"
                  onClick={() => setSelectedNotice(n)}
                >
                  Read more
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <button
              onClick={() => setSelectedNotice(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-secondary font-semibold">
              <Megaphone className="size-4" />
              {selectedNotice.date} · {selectedNotice.dept}
            </div>
            <h3 className="mt-3 text-xl font-bold">{selectedNotice.title}</h3>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{selectedNotice.text}</p>
            <div className="mt-6 rounded-md border border-secondary/20 bg-secondary/5 p-4 text-xs text-muted-foreground">
              Official communication reference: <b>DEL/CIV/{selectedNotice.dept.slice(0, 3).toUpperCase()}/2026</b>.
              Action teams are monitoring feedback in relevant district zones.
            </div>
            <div className="mt-6 flex justify-end">
              <Button size="sm" onClick={() => setSelectedNotice(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <h3 className="text-xl font-bold">Publish Department Notice</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Broadcast an official infrastructure update or field assessment.
            </p>
            <form onSubmit={handleCreateNotice} className="mt-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Department</label>
                <select
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                >
                  <option>Department of Urban Development</option>
                  <option>Delhi Jal Board</option>
                  <option>Public Works Department</option>
                  <option>Municipal Services</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ward drainage upgrade schedule"
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Notice Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide context on field activity, findings or planned interventions..."
                  className="mt-1.5 w-full rounded-md border border-input bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">Publish</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ==========================================================================
   ABOUT / HOW IT WORKS PAGE
   ========================================================================== */
export function AboutPage() {
  const steps = [
    'Citizen reports an issue with location and evidence',
    'AI-assisted classification groups related reports',
    'Demand is viewed alongside infrastructure gaps',
    'Affected population and project coverage add context',
    'Officials receive evidence for accountable policy review',
    'Actions and outcomes are tracked transparently',
  ];

  return (
    <main>
      <PageHeader
        eyebrow="About the Prototype"
        title="How It Works"
        description="A civic intelligence layer connecting public experience with infrastructure planning evidence."
      />

      <div className="page-container space-y-8 py-8">
        <DisclaimerBanner />

        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          {/* Not a complaint counter */}
          <Card>
            <Target className="size-8 text-primary" />
            <h2 className="mt-5 text-2xl font-bold">Not a complaint counter.</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              High complaint volume alone does not establish priority. The platform assembles
              multiple evidence signals so policymakers can understand demand in context.
            </p>
          </Card>

          {/* Evidence journey */}
          <Card>
            <SectionHeader title="Evidence journey" />
            <div className="space-y-4">
              {steps.map((text, idx) => (
                <div key={text} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-foreground">{text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Human accountability by design */}
        <Card className="border-l-2 border-l-secondary">
          <h2 className="font-bold text-lg">Human accountability by design</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            AI assists classification and synthesis. It does not decide what government should build.
            All development signals remain advisory evidence for review by responsible public
            authorities.
          </p>
        </Card>
      </div>
    </main>
  );
}
