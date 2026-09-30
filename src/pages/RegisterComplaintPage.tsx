import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, PageHeader, DisclaimerBanner } from '../components/ui/CardsAndHeaders';
import {
  InteractiveGoogleMap,
  SelectedLocationData,
  DELHI_KNOWN_LOCALITIES,
} from '../components/map/InteractiveGoogleMap';
import { VoiceDescriptionRecorder } from '../components/voice/VoiceDescriptionRecorder';
import { HelpfulDetailsGuidance } from '../components/complaint/HelpfulDetailsGuidance';
import { CATEGORIES, DISTRICTS } from '../data/demoData';
import { DataService } from '../services/dataService';
import { CategoryName, DistrictName } from '../types';
import { cn } from '../lib/utils';
import {
  Check,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Crosshair,
  Mic,
  Camera,
  Upload,
  Video,
  FileCheck,
  Sparkles,
  Trash2,
  Volume2,
  Navigation,
} from 'lucide-react';

const STEPS = [
  'Where & Who',
  'Issue Category',
  'Description',
  'Evidence',
  'Review & Submit',
];

export function RegisterComplaintPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);

  // Citizen Residential Details (Distinct from problem location)
  const [fullName, setFullName] = useState('Aarav Sharma');
  const [mobile, setMobile] = useState('+91 98123 45678');
  const [email, setEmail] = useState('aarav.sharma@example.in');
  const [currentDistrict, setCurrentDistrict] = useState<DistrictName>('North Delhi');
  const [currentLocality, setCurrentLocality] = useState('Civil Lines');
  const [currentPin, setCurrentPin] = useState('110054');

  // Actual Complaint / Problem Location (Distinct from citizen home address)
  const [problemDistrict, setProblemDistrict] = useState<DistrictName>('North Delhi');
  const [problemLocality, setProblemLocality] = useState('Kamla Nagar');
  const [problemPin, setProblemPin] = useState('110007');
  const [landmark, setLandmark] = useState('Near Market Clock Tower');
  const [problemLatitude, setProblemLatitude] = useState<number>(28.6811);
  const [problemLongitude, setProblemLongitude] = useState<number>(77.2037);

  const [category, setCategory] = useState<CategoryName>('Water Supply');
  const [subissue, setSubissue] = useState('Irregular supply');

  const [description, setDescription] = useState(
    'Water supply has been irregular for three weeks, affecting residents across two adjoining lanes.'
  );
  const [voiceNote, setVoiceNote] = useState(false);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([
    'Photo (Street Valve)',
    'Photo (Dry Tap)',
  ]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeCategory = CATEGORIES.find((c) => c.name === category) || CATEGORIES[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const res = await DataService.uploadFile(file);
      setEvidenceFiles((prev) => [...prev, res.name]);
    } catch (err) {
      console.error('File upload error', err);
    } finally {
      setUploading(false);
    }
  };

  const addSimulatedFile = (type: string) => {
    setEvidenceFiles((prev) => [
      ...prev,
      `${type} ${prev.length + 1} (${problemLocality})`,
    ]);
  };

  const removeFile = (idx: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Map Location Picker callback
  const handleMapLocationSelect = (loc: SelectedLocationData) => {
    setProblemDistrict(loc.district);
    setProblemLocality(loc.locality);
    setProblemPin(loc.pinCode);
    setProblemLatitude(loc.latitude);
    setProblemLongitude(loc.longitude);
    if (loc.landmark) {
      setLandmark(loc.landmark);
    }
  };

  // Voice Transcription handlers
  const handleApplyTranscription = (text: string, mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setDescription(text);
    } else {
      setDescription((prev) => (prev && prev.trim().length > 0 ? `${prev.trim()}\n\n${text}` : text));
    }
    setVoiceNote(true);
  };

  const handleAudioRecorded = (url: string | null) => {
    setVoiceAudioUrl(url);
    setVoiceNote(true);
    if (url && !evidenceFiles.some((f) => f.includes('Voice Note'))) {
      setEvidenceFiles((prev) => [...prev, 'Voice Note Audio (Recorded)']);
    }
  };

  // Dynamic Description Prompt click
  const handlePromptClick = (promptText: string) => {
    setDescription((prev) => {
      const trimmed = prev.trim();
      const addition = `• ${promptText}: `;
      return trimmed ? `${trimmed}\n${addition}` : addition;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const created = await DataService.createComplaint({
        issue: subissue,
        category,
        subissue,
        district: problemDistrict,
        locality: problemLocality,
        pinCode: problemPin,
        landmark,
        latitude: problemLatitude,
        longitude: problemLongitude,
        description,
        evidenceFiles,
        voiceNote: Boolean(voiceNote || voiceAudioUrl),
        voiceAudioUrl: voiceAudioUrl || undefined,
        citizenName: fullName,
        citizenMobile: mobile,
        citizenEmail: email,
        citizenDistrict: currentDistrict,
        citizenLocality: currentLocality,
        citizenPin: currentPin,
      });

      navigate('/complaint-submitted', { state: { complaint: created } });
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <PageHeader
        eyebrow="Citizen Reporting"
        title="Register a Complaint"
        description="A structured process connecting your report with district infrastructure evidence."
      />

      <div className="page-container space-y-8 py-8">
        <DisclaimerBanner />

        {/* Stepper Progress */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
          {STEPS.map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  'grid size-7 place-items-center rounded-full text-xs font-bold transition',
                  step === idx
                    ? 'bg-primary text-primary-foreground'
                    : step > idx
                    ? 'border border-primary text-primary'
                    : 'border border-border text-muted-foreground'
                )}
              >
                {step > idx ? <Check className="size-3.5" /> : idx + 1}
              </span>
              <span
                className={cn(
                  'text-xs font-medium sm:block',
                  step === idx
                    ? 'text-foreground'
                    : 'text-muted-foreground hidden md:inline'
                )}
              >
                {s}
              </span>
              {idx < STEPS.length - 1 && (
                <ChevronRight className="size-3 text-muted-foreground/50 mx-1 hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content Container */}
        <Card className="p-6 md:p-8">
          {/* STEP 0: Where & Who */}
          {step === 0 && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl font-bold">Your details</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Residence information is kept separate from the problem location.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Full Name</label>
                    <input
                      type="text"
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Mobile Number</label>
                    <input
                      type="text"
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Email</label>
                    <input
                      type="email"
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Residential District</label>
                    <select
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                      value={currentDistrict}
                      onChange={(e) => setCurrentDistrict(e.target.value as DistrictName)}
                    >
                      {Object.keys(DISTRICTS).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">Area / Locality</label>
                    <input
                      type="text"
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={currentLocality}
                      onChange={(e) => setCurrentLocality(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium">PIN Code</label>
                    <input
                      type="text"
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                    />
                  </div>
                </div>

                <p className="mt-4 flex items-center gap-2 text-sm text-primary">
                  <Check className="size-4" />
                  Citizen identity verified <span className="text-muted-foreground">(mock status)</span>
                </p>
              </div>

              <div className="border-t border-border" />

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">Where is the problem located?</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pinpoint the exact physical location of the infrastructure issue. Note: This is separate from your residential address above.
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                    <Navigation className="size-3.5" />
                    Delhi Problem Locator
                  </span>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
                  <div className="grid content-start gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">Problem District</label>
                      <select
                        className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                        value={problemDistrict}
                        onChange={(e) => {
                          const newDist = e.target.value as DistrictName;
                          setProblemDistrict(newDist);
                          const firstLoc = DISTRICTS[newDist]?.localities[0] || 'Civil Lines';
                          setProblemLocality(firstLoc);
                          const known = DELHI_KNOWN_LOCALITIES.find((l) => l.name === firstLoc);
                          if (known) {
                            setProblemLatitude(known.lat);
                            setProblemLongitude(known.lng);
                            setProblemPin(known.pin);
                          }
                        }}
                      >
                        {Object.keys(DISTRICTS).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground font-medium">
                        Problem Area / Locality
                      </label>
                      <input
                        type="text"
                        className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                        value={problemLocality}
                        onChange={(e) => setProblemLocality(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">PIN Code</label>
                        <input
                          type="text"
                          className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                          value={problemPin}
                          onChange={(e) => setProblemPin(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">Landmark / Street</label>
                        <input
                          type="text"
                          placeholder="Near school, market, pole..."
                          className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Quick Choose Another Location Helper */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const localities = DISTRICTS[problemDistrict].localities;
                          const next =
                            localities[(localities.indexOf(problemLocality) + 1) % localities.length];
                          setProblemLocality(next);
                          const known = DELHI_KNOWN_LOCALITIES.find((l) => l.name === next);
                          if (known) {
                            setProblemLatitude(known.lat);
                            setProblemLongitude(known.lng);
                            setProblemPin(known.pin);
                          }
                        }}
                      >
                        <MapPin className="size-3.5" />
                        Choose Another Locality
                      </Button>

                      <div className="text-[11px] font-mono text-muted-foreground ml-auto">
                        GPS: {problemLatitude.toFixed(4)}°N, {problemLongitude.toFixed(4)}°E
                      </div>
                    </div>
                  </div>

                  {/* Real Interactive Google Map */}
                  <div className="flex flex-col">
                    <InteractiveGoogleMap
                      mode="picker"
                      initialDistrict={problemDistrict}
                      initialLocality={problemLocality}
                      initialLat={problemLatitude}
                      initialLng={problemLongitude}
                      onLocationSelect={handleMapLocationSelect}
                      heightClass="min-h-[380px] h-[400px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Issue Category & Sub-issue */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl font-bold">What type of issue is this?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose one main category and the closest sub-issue.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => {
                      setCategory(cat.name);
                      setSubissue(cat.subissues[0]);
                    }}
                    className={cn(
                      'min-h-20 rounded-md border p-4 text-left transition cursor-pointer',
                      category === cat.name
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background hover:border-highlight/40'
                    )}
                  >
                    <b className="text-sm font-semibold">{cat.name}</b>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cat.subissues.slice(0, 3).join(' · ')}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-bold">Select a sub-issue</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeCategory.subissues.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubissue(sub)}
                      className={cn(
                        'rounded-md border px-3 py-2 text-xs transition cursor-pointer',
                        subissue === sub
                          ? 'border-secondary bg-secondary/10 text-secondary font-semibold'
                          : 'border-border text-muted-foreground hover:border-border/80'
                      )}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Description */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl font-bold">Describe the problem</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Provide as much context as possible. You can type freely or use the Voice Description recorder to speak your report in English or Hindi.
                </p>
              </div>

              {/* Real Voice Description & Speech-to-Text Transcription */}
              <VoiceDescriptionRecorder
                currentDescription={description}
                onApplyTranscription={handleApplyTranscription}
                onAudioRecorded={handleAudioRecorded}
              />

              <div className="relative">
                <textarea
                  className="mt-1 min-h-52 w-full rounded-md border border-input bg-background p-4 text-sm leading-6 text-foreground focus:border-primary focus:outline-none"
                  value={description}
                  maxLength={1000}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: The road near ABC School has severe potholes and becomes difficult to use after rainfall. School students and nearby residents are affected."
                />
                <span className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-1 rounded">
                  {description.length}/1000
                </span>
              </div>

              {/* Dynamic Guidance Based on Category & Sub-issue */}
              <HelpfulDetailsGuidance
                category={category}
                subissue={subissue}
                onPromptClick={handlePromptClick}
              />
            </div>
          )}

          {/* STEP 3: Evidence */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl font-bold">Add Evidence</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  For water, sanitation or road issues, photographs can help document the problem.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => addSimulatedFile('Photo')}
                >
                  <Camera className="size-5 text-secondary" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="size-5 text-secondary" />
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => addSimulatedFile('Video')}
                >
                  <Video className="size-5 text-secondary" />
                  Upload Video
                </Button>
              </div>

              {/* Recorded Voice Note Audio Preview if available */}
              {voiceAudioUrl && (
                <div className="flex items-center justify-between rounded-md border border-secondary/40 bg-secondary/10 p-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded bg-secondary/20 text-secondary">
                      <Volume2 className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-foreground">Recorded Voice Note Audio</p>
                      <p className="text-[11px] text-muted-foreground">Attached as evidence to this complaint</p>
                    </div>
                  </div>
                  <audio controls src={voiceAudioUrl} className="h-8 max-w-[200px]" />
                </div>
              )}

              {evidenceFiles.length > 0 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {evidenceFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md border border-border bg-background p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid size-10 shrink-0 place-items-center rounded bg-secondary/10 text-secondary">
                          <FileCheck className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <b className="block truncate text-xs">{file}</b>
                          <span className="text-[10px] text-muted-foreground">Ready for review</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-muted-foreground hover:text-destructive p-1 cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl font-bold">Review your complaint</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Please review the details below before submitting to the civic review queue.
                </p>
              </div>

              <div className="divide-y divide-border rounded-md border border-border bg-background">
                {[
                  [
                    'Citizen Information',
                    `${fullName} · ${mobile} (${email})\nResident of: ${currentLocality}, ${currentDistrict} - ${currentPin}`,
                  ],
                  [
                    'Problem Location',
                    `${problemLocality}, ${problemDistrict} - ${problemPin}\nLandmark: ${landmark || 'None specified'}\nGPS: ${problemLatitude.toFixed(4)}° N, ${problemLongitude.toFixed(4)}° E`,
                  ],
                  ['Category', category],
                  ['Sub-issue', subissue],
                  [
                    'Description',
                    `${description || 'No description provided.'}${
                      voiceNote || voiceAudioUrl ? ' (Voice description transcribed)' : ''
                    }`,
                  ],
                  [
                    'Evidence Attached',
                    evidenceFiles.length
                      ? `${evidenceFiles.length} file(s) attached: ${evidenceFiles.join(', ')}`
                      : 'No files attached',
                  ],
                ].map(([title, val], idx) => (
                  <div key={title} className="grid gap-1 p-4 sm:grid-cols-[170px_1fr]">
                    <span className="text-xs text-muted-foreground font-semibold">{title}</span>
                    <span className="text-sm font-medium whitespace-pre-line leading-relaxed">{val}</span>
                    <button
                      type="button"
                      onClick={() => setStep(idx === 0 || idx === 1 ? 0 : idx === 2 || idx === 3 ? 1 : idx === 4 ? 2 : 3)}
                      className="text-left text-[11px] text-secondary sm:col-start-2 cursor-pointer hover:underline pt-1"
                    >
                      Edit section
                    </button>
                  </div>
                ))}
              </div>

              {/* AI Assisted Box */}
              <div className="rounded-md border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-primary">
                    AI-Assisted Understanding
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7">
                  We understood your report as:
                  <br />
                  <b>{category}</b> → <b>{subissue}</b> → <b>{problemDistrict}</b> →{' '}
                  <span className="text-highlight font-semibold">Recurring issue</span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  You can correct this classification before submitting. AI-assisted classification
                  supports review; it does not make a government decision.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" type="button">
                    <Check className="size-4" />
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" type="button" onClick={() => setStep(1)}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="mt-8 flex justify-between border-t border-border pt-5">
            {step > 0 ? (
              <Button variant="outline" type="button" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
            ) : (
              <span />
            )}

            {step < 4 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Continue
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitting}>
                <Check className="size-4" />
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}

export function ComplaintSubmittedPage() {
  const navigate = useNavigate();
  // Get complaint from history state or fallback to demo
  const state = window.history.state?.usr?.complaint || {
    id: 'CIV-2026-004821',
    category: 'Water Supply',
    locality: 'Kamla Nagar',
    district: 'North Delhi',
    date: '21 Sep 2026',
  };

  const stages = [
    'Submitted',
    'AI Classified',
    'Similar Reports Identified',
    'Department Review',
    'Action Initiated',
    'Resolved',
  ];

  return (
    <main>
      <div className="page-container grid min-h-[74vh] place-items-center py-12">
        <Card className="w-full max-w-3xl text-center p-8">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-7" />
          </span>
          <h1 className="mt-5 text-3xl font-bold">Complaint submitted successfully</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your report is ready for civic review.</p>

          <div className="mx-auto mt-7 grid max-w-xl gap-4 rounded-md border border-border bg-background p-5 text-left sm:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Complaint ID</p>
              <p className="mt-1 text-sm font-bold text-foreground">{state.id}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Category</p>
              <p className="mt-1 text-sm font-bold text-foreground">{state.category}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Location</p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {state.locality}, {state.district}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Submission Date</p>
              <p className="mt-1 text-sm font-bold text-foreground">{state.date}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {stages.map((stage, idx) => (
              <div key={stage} className="flex items-center">
                <span
                  className={cn(
                    'rounded-md border px-2.5 py-2 text-[10px] font-medium',
                    idx === 0
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {stage}
                </span>
                {idx < stages.length - 1 && (
                  <span className="mx-1 text-xs text-muted-foreground">→</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={() => navigate(`/complaints/${state.id}`)}>
              View Complaint
            </Button>
            <Button variant="outline" onClick={() => navigate('/my-complaints')}>
              My Complaints
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
