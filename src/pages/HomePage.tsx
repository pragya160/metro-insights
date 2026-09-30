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
import { useLanguage } from '../context/LanguageContext';

export function HomePage() {
  const { language, t } = useLanguage();
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
      title: language === 'hi' ? 'शिकायत दर्ज करें' : 'Register a Complaint',
      text: language === 'hi'
        ? 'स्थान पिन, लाइव कैमरा फोटो और ऑडियो साक्ष्य के साथ स्थानीय बुनियादी ढांचे की समस्या दर्ज करें।'
        : 'Report a local infrastructure issue with interactive location and camera evidence.',
      button: language === 'hi' ? 'समस्या रिपोर्ट करें' : 'Report an Issue',
      to: '/register-complaint',
    },
    {
      icon: ClipboardList,
      title: language === 'hi' ? 'मेरी शिकायतें' : 'My Complaints',
      text: language === 'hi'
        ? 'अपनी जमा की गई शिकायतों की वर्तमान स्थिति और नगर निगम की प्रगति ट्रैक करें।'
        : 'Track reports you have submitted and view their real-time resolution status.',
      button: language === 'hi' ? 'शिकायतें देखें' : 'View Complaints',
      to: '/my-complaints',
    },
    {
      icon: Map,
      title: language === 'hi' ? 'मेरा जिला' : 'My District',
      text: language === 'hi'
        ? 'अपने जिले में नागरिक समस्याएं, बुनियादी ढांचा अभाव और सक्रिय सरकारी परियोजनाएं देखें।'
        : 'Explore citizen concerns, infrastructure gaps and active development in your ward.',
      button: language === 'hi' ? 'जिला अन्वेषण' : 'Explore District',
      to: '/my-district',
    },
    {
      icon: BarChart3,
      title: language === 'hi' ? 'विकास रिपोर्ट' : 'Development Insights',
      text: language === 'hi'
        ? 'देखें कि नागरिक मांग और जमीनी डेटा से नगर निगम की बजट और विकास प्राथमिकताएं कैसे बनती हैं।'
        : 'See how citizen demand and infrastructure data shape development priority signals.',
      button: language === 'hi' ? 'रिपोर्ट देखें' : 'View Insights',
      to: '/development-insights',
    },
  ];

  const categoryLabels = CATEGORIES.map((c) => {
    if (language === 'hi') {
      if (c.name.includes('Water')) return 'जल आपूर्ति';
      if (c.name.includes('Road')) return 'सड़क व गड्ढे';
      if (c.name.includes('Sanitation')) return 'स्वच्छता';
      if (c.name.includes('Lighting')) return 'स्ट्रीट लाइट';
    }
    return c.name;
  });

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="map-grid absolute inset-y-0 right-0 w-2/3 opacity-30 pointer-events-none" />
        <div className="page-container relative grid min-h-[520px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">
              {language === 'hi'
                ? 'सार्वजनिक अवसंरचना आसूचना प्रणाली • दिल्ली एनसीआर'
                : 'Public infrastructure intelligence • Delhi'}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] sm:text-6xl">
              {language === 'hi' ? (
                <>
                  आपका समुदाय।
                  <br />
                  <span className="text-highlight">आपकी आवाज।</span>
                  <br />
                  आपका विकास।
                </>
              ) : (
                <>
                  Your community.
                  <br />
                  <span className="text-highlight">Your voice.</span>
                  <br />
                  Your development.
                </>
              )}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              {language === 'hi'
                ? 'स्थानीय बुनियादी ढांचे की समस्याओं की रिपोर्ट करें, अपने जिले की स्थिति देखें, और साक्ष्य-आधारित प्राथमिकताओं से नगर निगम की विकास योजनाओं को गति दें।'
                : 'Report local infrastructure issues, explore your district, and help identify development priorities through evidence from citizen demand and infrastructure data.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register-complaint">
                  <FilePlus className="size-5" />
                  {language === 'hi' ? 'शिकायत दर्ज करें' : 'Register a Complaint'}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/my-district">
                  <Map className="size-5" />
                  {language === 'hi' ? 'जिला स्थिति देखें' : 'Explore Your District'}
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
            title={language === 'hi' ? 'नागरिक सेवाएं' : 'Citizen Services'}
            subtitle={
              language === 'hi'
                ? 'अपने वार्ड में बुनियादी ढांचे की समस्याओं की रिपोर्ट करें और ट्रैक करें'
                : 'Report, track and understand infrastructure evidence in your district'
            }
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
            title={language === 'hi' ? 'दिल्ली जिला अवलोकन' : 'Delhi District Overview'}
            subtitle={
              language === 'hi'
                ? 'तीन सक्रिय निगरानी वाले जिले • कोई रैंकिंग नहीं'
                : 'Three monitored districts • No ranking'
            }
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {(Object.entries(districts) as [DistrictName, DistrictData][]).map(([name, data]) => {
              const districtNameHi =
                name === 'North Delhi' ? 'उत्तर दिल्ली' : name === 'South Delhi' ? 'दक्षिण दिल्ली' : 'पूर्वी दिल्ली';
              return (
                <Card key={name}>
                  <p className="text-xs uppercase tracking-[.14em] text-secondary">
                    {language === 'hi' ? districtNameHi : name}
                  </p>
                  <h3 className="mt-3 text-lg font-bold">
                    {language === 'hi' ? 'मुख्य समस्या:' : 'Primary Concern:'} {data.primary}
                  </h3>
                  <div className="my-5 grid grid-cols-3 gap-2 border-y border-border py-4 text-center">
                    <div>
                      <b className="block text-lg text-highlight">
                        {data.reports.toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN')}
                      </b>
                      <span className="text-[10px] text-muted-foreground">
                        {language === 'hi' ? 'शिकायतें' : 'Reports'}
                      </span>
                    </div>
                    <div>
                      <b className="block text-lg text-highlight">{data.gaps}</b>
                      <span className="text-[10px] text-muted-foreground">
                        {language === 'hi' ? 'अभाव' : 'Gaps'}
                      </span>
                    </div>
                    <div>
                      <b className="block text-lg text-highlight">{data.projects}</b>
                      <span className="text-[10px] text-muted-foreground">
                        {language === 'hi' ? 'परियोजनाएं' : 'Projects'}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link to="/my-district">
                      {language === 'hi' ? 'जिला विवरण देखें' : 'View District'}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {language === 'hi'
              ? 'सभी आंकड़े वास्तविक परीक्षण और प्रदर्शन के लिए हैं।'
              : 'All numbers are fictional demonstration data.'}
          </p>
        </section>

        {/* Reporting Breakdown & Latest Notices */}
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <SectionHeader
              title={
                language === 'hi' ? 'नागरिक क्या रिपोर्ट कर रहे हैं' : 'What Citizens Are Reporting'
              }
            />
            <Card>
              <CategoryBars values={[29, 27, 30, 14]} labels={categoryLabels} />
            </Card>
          </section>

          <section>
            <SectionHeader
              title={language === 'hi' ? 'नवीनतम जन सूचनाएं' : 'Latest Notices'}
              action={
                <Button asChild variant="link">
                  <Link to="/notices">{language === 'hi' ? 'सभी देखें' : 'View all'}</Link>
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
