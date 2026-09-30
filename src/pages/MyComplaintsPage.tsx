import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, Badge, PageHeader, SectionHeader, DisclaimerBanner } from '../components/ui/CardsAndHeaders';
import { DistrictMap } from '../components/ui/ChartsAndMaps';
import { InteractiveGoogleMap } from '../components/map/InteractiveGoogleMap';
import { DataService, subscribeToDataChanges } from '../services/dataService';
import { Complaint, ComplaintStatus } from '../types';
import { TIMELINE_STAGES } from '../data/demoData';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import {
  FilePlus,
  ArrowRight,
  Check,
  MapPin,
  Clock,
  Layers,
  ArrowLeft,
  Trash2,
  Volume2,
} from 'lucide-react';

export function MyComplaintsPage() {
  const { language } = useLanguage();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    DataService.getComplaints().then(setComplaints);
    const unsub = subscribeToDataChanges(() => {
      DataService.getComplaints().then(setComplaints);
    });
    return unsub;
  }, []);

  const filtered = complaints.filter((c) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Under Review' && (c.status === 'Under Review' || c.status === 'Submitted' || c.status === 'Department Review')) ||
      c.status === filter;

    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.issue.toLowerCase().includes(search.toLowerCase()) ||
      c.locality.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <main>
      <PageHeader
        eyebrow={language === 'hi' ? 'नागरिक सेवा' : 'Citizen Dashboard'}
        title={language === 'hi' ? 'मेरी शिकायतें' : 'My Complaints'}
        description={
          language === 'hi'
            ? 'अपनी दर्ज शिकायतों को ट्रैक करें और समाधान तक की स्थिति देखें।'
            : 'Track your reports and follow action updates from submission to resolution.'
        }
        action={
          <Button asChild>
            <Link to="/register-complaint">
              <FilePlus className="size-4" />
              {language === 'hi' ? 'नई शिकायत दर्ज करें' : 'New complaint'}
            </Link>
          </Button>
        }
      />

      <div className="page-container space-y-6 py-8">
        <DisclaimerBanner />

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'All', label: language === 'hi' ? 'सभी' : 'All' },
              { id: 'Under Review', label: language === 'hi' ? 'समीक्षाधीन' : 'Under Review' },
              { id: 'Action Initiated', label: language === 'hi' ? 'कार्रवाई शुरू' : 'Action Initiated' },
              { id: 'Resolved', label: language === 'hi' ? 'समाधान हो गया' : 'Resolved' },
            ].map(({ id, label }) => (
              <Button
                key={id}
                variant={filter === id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(id)}
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder={
                language === 'hi'
                  ? 'शिकायत संख्या या क्षेत्र खोजें...'
                  : 'Search reports or locality...'
              }
              className="h-9 w-full rounded-md border border-input bg-surface px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Complaints List */}
        <div className="grid gap-3">
          {filtered.map((item) => (
            <Link key={item.id} to={`/complaints/${item.id}`} className="group block">
              <Card className="grid gap-3 transition hover:border-primary/50 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-semibold text-secondary">{item.id}</p>
                  <h2 className="mt-1 text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.issue}
                  </h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.category} · {item.locality}, {item.district} · {item.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{item.status}</Badge>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </Card>
            </Link>
          ))}

          {filtered.length === 0 && (
            <Card className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No complaints found matching "{filter}".
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/register-complaint">Submit New Report</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

export function ComplaintDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    DataService.getComplaintById(id).then((res) => {
      setComplaint(res);
      setLoading(false);
    });

    const unsub = subscribeToDataChanges(() => {
      if (id) {
        DataService.getComplaintById(id).then(setComplaint);
      }
    });
    return unsub;
  }, [id]);

  if (loading) {
    return (
      <div className="page-container py-20 text-center">
        <p className="text-sm text-muted-foreground">Loading report details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="page-container py-20 text-center">
        <h2 className="text-2xl font-bold">Complaint Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The requested report ID could not be found.</p>
        <Button asChild variant="outline" className="mt-5">
          <Link to="/my-complaints">Back to Complaints</Link>
        </Button>
      </div>
    );
  }

  // Active step in timeline: 0 to 5
  const currentStep =
    complaint.status === 'Resolved'
      ? 5
      : complaint.status === 'Action Initiated'
      ? 4
      : complaint.status === 'Department Review'
      ? 3
      : complaint.status === 'Similar Reports Identified'
      ? 2
      : complaint.status === 'AI Classified'
      ? 1
      : 0;

  const handleAdvanceStatus = async () => {
    const nextStatusIndex = Math.min(currentStep + 1, TIMELINE_STAGES.length - 1);
    const nextStatus = TIMELINE_STAGES[nextStatusIndex] as ComplaintStatus;
    await DataService.updateComplaintStatus(complaint.id, nextStatus);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this complaint record?')) {
      await DataService.deleteComplaint(complaint.id);
      navigate('/my-complaints');
    }
  };

  return (
    <main>
      <PageHeader
        eyebrow="Complaint Details"
        title={complaint.id}
        description={`${complaint.issue} · submitted ${complaint.date}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/my-complaints">
                <ArrowLeft className="size-4" />
                All Complaints
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:bg-destructive/10"
              title="Delete complaint"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="page-container space-y-7 py-8">
        <DisclaimerBanner />

        <div className="grid gap-6 lg:grid-cols-[1fr_.72fr]">
          {/* Left Column: Complaint metadata and timeline */}
          <div className="space-y-6">
            {/* Status and metadata card */}
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current Status</p>
                  <h2 className="mt-1 text-xl font-bold text-foreground">{complaint.status}</h2>
                </div>
                <Badge>{complaint.status}</Badge>
              </div>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                {[
                  ['Problem Location', `${complaint.locality}, ${complaint.district}${complaint.pinCode ? ` (${complaint.pinCode})` : ''}`],
                  ['Landmark', complaint.landmark || 'Near locality center'],
                  ['Category', complaint.category],
                  ['Sub-issue', complaint.issue],
                  [
                    'GPS Coordinates',
                    complaint.latitude && complaint.longitude
                      ? `${complaint.latitude.toFixed(4)}° N, ${complaint.longitude.toFixed(4)}° E`
                      : '28.6811° N, 77.2037° E',
                  ],
                  [
                    'Citizen Residential',
                    `${complaint.citizenLocality || 'Civil Lines'}, ${complaint.citizenDistrict || 'North Delhi'} (${complaint.citizenPin || '110054'})`,
                  ],
                  ['Submitted Date', complaint.date],
                  [
                    'Voice Note Status',
                    complaint.voiceNote || complaint.voiceAudioUrl
                      ? 'Spoken & Transcribed'
                      : 'Written Text Entry',
                  ],
                ].map(([label, val]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-sm font-semibold">{val}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 border-t border-border pt-5">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="mt-2 text-sm leading-6 whitespace-pre-line">{complaint.description}</p>
              </div>

              {/* Voice Note Audio Player if recorded */}
              {complaint.voiceAudioUrl && (
                <div className="mt-4 flex items-center justify-between rounded-md border border-secondary/40 bg-secondary/10 p-3">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="size-4 text-secondary" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Recorded Voice Audio</p>
                      <p className="text-[10px] text-muted-foreground">Citizen voice recording</p>
                    </div>
                  </div>
                  <audio controls src={complaint.voiceAudioUrl} className="h-8 max-w-[200px]" />
                </div>
              )}

              <div className="mt-5 rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Evidence Files</p>
                <p className="mt-1 text-sm font-medium">
                  {complaint.evidenceFiles && complaint.evidenceFiles.length > 0
                    ? `${complaint.evidenceFiles.length} file(s) attached: ${complaint.evidenceFiles.join(', ')}`
                    : '2 photographs · 1 GPS location pin'}
                </p>
              </div>
            </Card>

            {/* Status Timeline */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <SectionHeader title="Status Timeline" />
                {currentStep < TIMELINE_STAGES.length - 1 && (
                  <Button size="sm" variant="outline" onClick={handleAdvanceStatus}>
                    <Clock className="size-3.5" />
                    Simulate Next Stage
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                {TIMELINE_STAGES.map((stage, idx) => (
                  <div key={stage} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'grid size-6 place-items-center rounded-full border text-xs font-semibold',
                          idx <= currentStep
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground'
                        )}
                      >
                        {idx <= currentStep ? <Check className="size-3.5" /> : idx + 1}
                      </span>
                      {idx < TIMELINE_STAGES.length - 1 && (
                        <span
                          className={cn(
                            'h-8 w-px',
                            idx < currentStep ? 'bg-primary' : 'bg-border'
                          )}
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        'pt-0.5 text-sm',
                        idx <= currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {stage}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Community Context & District Map */}
          <div className="space-y-6">
            <Card>
              <SectionHeader title="Community Context" />
              <p className="text-3xl font-bold text-highlight">{complaint.related}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                related reports recorded in this locality.
              </p>

              <p className="mt-5 text-3xl font-bold text-secondary">{complaint.similar}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                similar reports grouped with your report.
              </p>

              <p className="mt-5 text-xs leading-5 text-muted-foreground">
                Related and similar reports may describe connected conditions; they are not assumed
                to be identical.
              </p>
            </Card>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                Problem Location GPS Map
              </span>
              <InteractiveGoogleMap
                mode="explorer"
                initialDistrict={complaint.district}
                initialLocality={complaint.locality}
                initialLat={complaint.latitude || 28.6811}
                initialLng={complaint.longitude || 77.2037}
                complaints={[complaint]}
                heightClass="min-h-[300px] h-[340px]"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
