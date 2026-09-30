import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import {
  Card,
  Badge,
  StatCard,
  PageHeader,
  SectionHeader,
  DisclaimerBanner,
} from '../components/ui/CardsAndHeaders';
import { DataTable, CategoryBars, TrendChart, DistrictMap } from '../components/ui/ChartsAndMaps';
import { CATEGORIES } from '../data/demoData';
import { DataService, subscribeToDataChanges } from '../services/dataService';
import { DistrictData, DistrictName } from '../types';

export function DistrictExplorerPage({ policy = false }: { policy?: boolean }) {
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictName>('North Delhi');
  const [districts, setDistricts] = useState<Record<DistrictName, DistrictData>>(
    DataService.getDistricts()
  );

  useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setDistricts(DataService.getDistricts());
    });
    return unsub;
  }, []);

  const dData = districts[selectedDistrict] || districts['North Delhi'];

  return (
    <main>
      <PageHeader
        eyebrow={policy ? 'Policy workspace' : 'Citizen district explorer'}
        title={policy ? 'District Overview' : 'My District'}
        description="Explore citizen demand, infrastructure gaps, affected population and active development work without exposing individual citizen locations."
      />

      <div className="page-container space-y-8 py-8">
        <DisclaimerBanner />

        {/* District Switcher Tabs */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(districts) as DistrictName[]).map((dName) => (
            <Button
              key={dName}
              variant={selectedDistrict === dName ? 'default' : 'outline'}
              onClick={() => setSelectedDistrict(dName)}
            >
              {dName}
            </Button>
          ))}
        </div>

        {/* 5 Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Citizen Reports" value={dData.reports.toLocaleString('en-IN')} />
          <StatCard label="Infrastructure Gaps" value={dData.gaps} />
          <StatCard label="Active Projects" value={dData.projects} />
          <StatCard label="Est. Population Affected" value={dData.affected} />
          <StatCard label="Reports Under Action" value={dData.underAction} />
        </div>

        {/* Development Context Narrative */}
        <Card className="border-l-2 border-l-primary">
          <p className="text-xs uppercase tracking-[0.14em] text-primary font-semibold">
            Development context • {dData.primary}
          </p>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
            {dData.narrative}
          </p>
        </Card>

        {/* Category Breakdown & Trends */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <SectionHeader
              title="Category Breakdown"
              subtitle="Share of reports by sector"
            />
            <CategoryBars
              values={dData.breakdown}
              labels={CATEGORIES.map((c) => c.name)}
            />
          </Card>

          <Card>
            <SectionHeader
              title="Report Trends"
              subtitle="Monthly related reports, Apr–Sep 2026"
            />
            <TrendChart values={dData.trend} />
          </Card>
        </div>

        {/* Infrastructure Gaps Table */}
        <section>
          <SectionHeader
            title="Infrastructure Gaps"
            subtitle="Structured evidence currently available for review"
          />
          <DataTable
            headers={['Sector', 'Gap', 'Location', 'Affected Population', 'Status']}
            rows={dData.gapsList.map((g) => [
              g[0],
              g[1],
              g[2],
              g[3],
              <Badge key={g[1]}>{g[4]}</Badge>,
            ])}
          />
        </section>

        {/* Active Development Projects Table */}
        <section>
          <SectionHeader
            title="Active Development Projects"
            subtitle="Coverage helps contextualise demand; it does not erase it"
          />
          <DataTable
            headers={['Project', 'Sector', 'Location', 'Status', 'Coverage']}
            rows={dData.projectsList.map((p) => [
              p[0],
              p[1],
              p[2],
              <Badge key={p[0]}>{p[3]}</Badge>,
              p[4],
            ])}
          />
        </section>

        {/* District Demand Map */}
        <section>
          <SectionHeader
            title="District Demand Map"
            subtitle="Aggregated clusters protect citizen privacy"
          />
          <DistrictMap
            selected={selectedDistrict}
            onSelect={(d) => setSelectedDistrict(d)}
          />
        </section>
      </div>
    </main>
  );
}
