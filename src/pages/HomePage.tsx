import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, SectionHeader, DisclaimerBanner } from '../components/ui/CardsAndHeaders';
import { CategoryBars } from '../components/ui/ChartsAndMaps';
import { InteractiveGoogleMap } from '../components/map/InteractiveGoogleMap';
import { CATEGORIES } from '../data/demoData';
import { DataService, subscribeToDataChanges } from '../services/dataService';
import { DistrictData, DistrictName, NoticeItem } from '../types';
import {
  FilePlus,
  Map,
  ClipboardList,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export function HomePage() {
  const [districts, setDistricts] = useState<Record<DistrictName, DistrictData>>(
    DataService.getDistricts()
  );
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    DataService.getNotices().then(setNotices);
    const unsub = subscribeToDataChanges(() => {
      setDistricts(DataService.getDistricts());
      DataService.getNotices().then(setNotices);
    });
    return unsub;
  }, []);

  const citizenServices = [
    {
      icon: FilePlus,
      title: 'Register a Complaint',
      text: 'Report a local infrastructure issue with location and evidence.',
      button: 'Report an Issue',
      to: '/register-complaint',
    },
    {
      icon: ClipboardList,
      title: 'My Complaints',
      text: 'Track reports you have submitted and view their current status.',
      button: 'View Complaints',
      to: '/my-complaints',
    },
    {
      icon: Map,
      title: 'My District',
      text: 'Explore citizen concerns, infrastructure gaps and development activity.',
      button: 'Explore District',
      to: '/my-district',
    },
    {
      icon: BarChart3,
      title: 'Development Insights',
      text: 'See how citizen demand and infrastructure data shape development priority signals.',
      button: 'View Insights',
      to: '/development-insights',
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="map-grid absolute inset-y-0 right-0 w-2/3 opacity-30 pointer-events-none" />
        <div className="page-container relative grid min-h-[520px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
              Public infrastructure intelligence • Delhi
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] sm:text-6xl">
              Your community.
              <br />
              <span className="text-highlight">Your voice.</span>
              <br />
              Your development.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              Report local infrastructure issues, explore your district, and help identify development
              priorities through evidence from citizen demand and infrastructure data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register-complaint">
                  <FilePlus className="size-5" />
                  Register a Complaint
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/my-district">
                  <Map className="size-5" />
                  Explore Your District
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <InteractiveGoogleMap mode="explorer" heightClass="h-[380px]" />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="page-container space-y-16 py-12">
        <DisclaimerBanner />

        {/* Citizen Services */}
        <section>
          <SectionHeader
            title="Citizen Services"
            subtitle="Report, track and understand infrastructure evidence in your district"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {citizenServices.map((svc) => (
              <Card key={svc.title} className="flex min-h-60 flex-col">
                <svc.icon className="size-7 text-primary" />
                <h3 className="mt-6 text-lg font-bold">{svc.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{svc.text}</p>
                <Button asChild variant="outline" className="mt-5 justify-between">
                  <Link to={svc.to}>
                    {svc.button}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Delhi District Overview */}
        <section>
          <SectionHeader
            title="Delhi District Overview"
            subtitle="Three monitored districts • No ranking"
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {(Object.entries(districts) as [DistrictName, DistrictData][]).map(([name, data]) => (
              <Card key={name}>
                <p className="text-xs uppercase tracking-[.14em] text-secondary">{name}</p>
                <h3 className="mt-3 text-lg font-bold">Primary Concern: {data.primary}</h3>
                <div className="my-5 grid grid-cols-3 gap-2 border-y border-border py-4 text-center">
                  <div>
                    <b className="block text-lg text-highlight">
                      {data.reports.toLocaleString('en-IN')}
                    </b>
                    <span className="text-[10px] text-muted-foreground">Reports</span>
                  </div>
                  <div>
                    <b className="block text-lg text-highlight">{data.gaps}</b>
                    <span className="text-[10px] text-muted-foreground">Gaps</span>
                  </div>
                  <div>
                    <b className="block text-lg text-highlight">{data.projects}</b>
                    <span className="text-[10px] text-muted-foreground">Projects</span>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link to="/my-district">
                    View District
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            All numbers are fictional demonstration data.
          </p>
        </section>

        {/* Reporting Breakdown & Latest Notices */}
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <SectionHeader title="What Citizens Are Reporting" />
            <Card>
              <CategoryBars
                values={[29, 27, 30, 14]}
                labels={CATEGORIES.map((c) => c.name)}
              />
            </Card>
          </section>

          <section>
            <SectionHeader
              title="Latest Notices"
              action={
                <Button asChild variant="link">
                  <Link to="/notices">View all</Link>
                </Button>
              }
            />
            <div className="space-y-3">
              {notices.slice(0, 3).map((notice) => (
                <Link
                  key={notice.title}
                  to="/notices"
                  className="block border-b border-border pb-3 transition hover:border-primary/50"
                >
                  <span className="text-[10px] uppercase text-secondary">
                    {notice.date} · {notice.dept}
                  </span>
                  <b className="mt-1 block text-sm font-semibold">{notice.title}</b>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
