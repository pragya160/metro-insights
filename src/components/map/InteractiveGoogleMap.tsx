import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';
import {
  DistrictName,
  CategoryName,
  Complaint,
  MapHotspot,
} from '../../types';
import {
  DISTRICTS,
  MAP_HOTSPOTS,
} from '../../data/demoData';
import { Button } from '../ui/Button';
import {
  MapPin,
  Crosshair,
  Search,
  Check,
  Flame,
  AlertTriangle,
  Layers,
  Info,
  Maximize2,
  Navigation,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Standard Delhi Coordinates & Localities Reference
export const DELHI_CENTER = { lat: 28.6139, lng: 77.2090 };

export interface SelectedLocationData {
  latitude: number;
  longitude: number;
  district: DistrictName;
  locality: string;
  pinCode: string;
  landmark?: string;
}

export const DELHI_KNOWN_LOCALITIES: {
  name: string;
  district: DistrictName;
  lat: number;
  lng: number;
  pin: string;
}[] = [
  // North Delhi
  { name: 'Kamla Nagar', district: 'North Delhi', lat: 28.6811, lng: 77.2037, pin: '110007' },
  { name: 'Civil Lines', district: 'North Delhi', lat: 28.6814, lng: 77.2227, pin: '110054' },
  { name: 'Model Town', district: 'North Delhi', lat: 28.7159, lng: 77.1910, pin: '110009' },
  { name: 'Kashmere Gate', district: 'North Delhi', lat: 28.6675, lng: 77.2285, pin: '110006' },
  { name: 'Timarpur', district: 'North Delhi', lat: 28.7011, lng: 77.2201, pin: '110054' },
  { name: 'Rohini Sector 7', district: 'North Delhi', lat: 28.7106, lng: 77.1189, pin: '110085' },

  // South Delhi
  { name: 'Saket', district: 'South Delhi', lat: 28.5245, lng: 77.2066, pin: '110017' },
  { name: 'Mehrauli', district: 'South Delhi', lat: 28.5177, lng: 77.1852, pin: '110030' },
  { name: 'Greater Kailash', district: 'South Delhi', lat: 28.5482, lng: 77.2426, pin: '110048' },
  { name: 'Hauz Khas', district: 'South Delhi', lat: 28.5494, lng: 77.2001, pin: '110016' },
  { name: 'Vasant Kunj', district: 'South Delhi', lat: 28.5244, lng: 77.1555, pin: '110070' },
  { name: 'Lajpat Nagar', district: 'South Delhi', lat: 28.5677, lng: 77.2433, pin: '110024' },

  // East Delhi
  { name: 'Laxmi Nagar', district: 'East Delhi', lat: 28.6304, lng: 77.2772, pin: '110092' },
  { name: 'Mayur Vihar Phase I', district: 'East Delhi', lat: 28.6078, lng: 77.2994, pin: '110091' },
  { name: 'Preet Vihar', district: 'East Delhi', lat: 28.6367, lng: 77.2965, pin: '110092' },
  { name: 'Anand Vihar', district: 'East Delhi', lat: 28.6475, lng: 77.3158, pin: '110092' },
  { name: 'Patparganj', district: 'East Delhi', lat: 28.6288, lng: 77.3012, pin: '110092' },
];

export function findClosestDelhiLocality(lat: number, lng: number) {
  let closest = DELHI_KNOWN_LOCALITIES[0];
  let minDistance = Infinity;

  for (const loc of DELHI_KNOWN_LOCALITIES) {
    const dLat = loc.lat - lat;
    const dLng = loc.lng - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }
  return closest;
}

interface InteractiveGoogleMapProps {
  mode?: 'picker' | 'explorer';
  initialDistrict?: DistrictName | string;
  initialLocality?: string;
  initialLat?: number;
  initialLng?: number;
  complaints?: Complaint[];
  hotspots?: MapHotspot[];
  onLocationSelect?: (location: SelectedLocationData) => void;
  className?: string;
  heightClass?: string;
  onHotspotClick?: (hotspot: MapHotspot) => void;
  selectedCategory?: string;
  selectedDistrict?: string;
}

export function InteractiveGoogleMap({
  mode = 'explorer',
  initialDistrict = 'North Delhi',
  initialLocality = 'Kamla Nagar',
  initialLat = 28.6811,
  initialLng = 77.2037,
  complaints = [],
  hotspots = MAP_HOTSPOTS,
  onLocationSelect,
  className,
  heightClass = 'min-h-[420px] h-[480px]',
  onHotspotClick,
  selectedCategory = 'All',
  selectedDistrict = 'All',
}: InteractiveGoogleMapProps) {
  const map = useMap();
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [selectedLocalityName, setSelectedLocalityName] = useState(initialLocality);
  const [selectedDistrictName, setSelectedDistrictName] = useState<DistrictName>(
    (initialDistrict in DISTRICTS ? initialDistrict : 'North Delhi') as DistrictName
  );
  const [selectedPinCode, setSelectedPinCode] = useState('110007');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof DELHI_KNOWN_LOCALITIES>([]);
  const [activeHotspot, setActiveHotspot] = useState<MapHotspot | null>(null);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  // Sync initial coordinates
  useEffect(() => {
    if (initialLat && initialLng) {
      setMarkerPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  // Center map on marker position change
  const panTo = useCallback(
    (lat: number, lng: number, zoom = 14) => {
      setMarkerPosition({ lat, lng });
      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(zoom);
      }
    },
    [map]
  );

  // Filter complaints according to category and district if in explorer mode
  const displayComplaints = complaints.filter((c) => {
    if (selectedDistrict !== 'All' && c.district !== selectedDistrict) return false;
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    return true;
  });

  const displayHotspots = hotspots.filter((h) => {
    if (selectedDistrict !== 'All' && h.district !== selectedDistrict) return false;
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
    return true;
  });

  // Handle map click in picker mode
  const handleMapClick = (e: MapMouseEvent) => {
    if (mode !== 'picker' || !e.detail.latLng) return;
    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;
    setMarkerPosition({ lat, lng });
    setHasConfirmed(false);

    // Auto-detect closest Delhi locality and district
    const closest = findClosestDelhiLocality(lat, lng);
    setSelectedDistrictName(closest.district);
    setSelectedLocalityName(closest.name);
    setSelectedPinCode(closest.pin);

    onLocationSelect?.({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      district: closest.district,
      locality: closest.name,
      pinCode: closest.pin,
      landmark: `Pinned coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    });
  };

  // Drag marker end
  const handleMarkerDragEnd = (e: any) => {
    if (!e.latLng) return;
    const lat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
    const lng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
    setMarkerPosition({ lat, lng });
    setHasConfirmed(false);

    const closest = findClosestDelhiLocality(lat, lng);
    setSelectedDistrictName(closest.district);
    setSelectedLocalityName(closest.name);
    setSelectedPinCode(closest.pin);

    onLocationSelect?.({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      district: closest.district,
      locality: closest.name,
      pinCode: closest.pin,
      landmark: `Pinned coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    });
  };

  // Search input handler
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    const q = val.toLowerCase();
    const matches = DELHI_KNOWN_LOCALITIES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        l.pin.includes(q)
    );
    setSearchResults(matches.slice(0, 5));
  };

  const handleSelectSearchResult = (loc: typeof DELHI_KNOWN_LOCALITIES[0]) => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedDistrictName(loc.district);
    setSelectedLocalityName(loc.name);
    setSelectedPinCode(loc.pin);
    panTo(loc.lat, loc.lng, 15);

    onLocationSelect?.({
      latitude: loc.lat,
      longitude: loc.lng,
      district: loc.district,
      locality: loc.name,
      pinCode: loc.pin,
    });
  };

  // Use Current Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        panTo(lat, lng, 15);

        const closest = findClosestDelhiLocality(lat, lng);
        setSelectedDistrictName(closest.district);
        setSelectedLocalityName(closest.name);
        setSelectedPinCode(closest.pin);

        onLocationSelect?.({
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
          district: closest.district,
          locality: closest.name,
          pinCode: closest.pin,
          landmark: 'GPS Verified Location',
        });
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation warning:', err.message);
        // Fallback to Kamla Nagar
        panTo(28.6811, 77.2037, 14);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleConfirmLocation = () => {
    setHasConfirmed(true);
    onLocationSelect?.({
      latitude: Number(markerPosition.lat.toFixed(6)),
      longitude: Number(markerPosition.lng.toFixed(6)),
      district: selectedDistrictName,
      locality: selectedLocalityName,
      pinCode: selectedPinCode,
    });
  };

  return (
    <div className={cn('relative flex flex-col rounded-lg border border-border overflow-hidden bg-background shadow-md', className)}>
      {/* Top Map Action Bar in Picker Mode */}
      {mode === 'picker' && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface/90 px-3 py-2 z-10">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Delhi locality (e.g. Kamla Nagar, Saket)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-md border border-border bg-surface py-1 shadow-lg z-50 max-h-48 overflow-y-auto">
                {searchResults.map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => handleSelectSearchResult(loc)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-primary/10 transition cursor-pointer"
                  >
                    <div>
                      <b className="font-semibold text-foreground">{loc.name}</b>
                      <span className="text-muted-foreground ml-2">({loc.district})</span>
                    </div>
                    <span className="text-[10px] text-secondary font-mono">{loc.pin}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="text-xs h-9"
            >
              <Crosshair className={cn('size-3.5', isLocating && 'animate-spin text-primary')} />
              {isLocating ? 'Locating...' : 'Use GPS Location'}
            </Button>

            <Button
              type="button"
              variant={hasConfirmed ? 'secondary' : 'default'}
              size="sm"
              onClick={handleConfirmLocation}
              className="text-xs h-9 font-semibold"
            >
              <Check className="size-3.5" />
              {hasConfirmed ? 'Location Confirmed' : 'Confirm Marker Location'}
            </Button>
          </div>
        </div>
      )}

      {/* Real Google Map Container */}
      <div className={cn('relative w-full overflow-hidden', heightClass)}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={markerPosition}
          defaultZoom={mode === 'picker' ? 14 : 11}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={handleMapClick}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          className="w-full h-full"
        >
          {/* Picker Mode Draggable Marker */}
          {mode === 'picker' && (
            <AdvancedMarker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleMarkerDragEnd}
              title={`Problem Location: ${selectedLocalityName}`}
            >
              <div className="group relative flex flex-col items-center cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground shadow-lg border border-white/20 whitespace-nowrap">
                  <MapPin className="size-3.5" />
                  <span>{selectedLocalityName}</span>
                </div>
                <div className="size-3 -mt-1 rotate-45 bg-primary border-r border-b border-white/20" />
              </div>
            </AdvancedMarker>
          )}

          {/* Explorer Mode: Aggregated Demand Hotspots */}
          {mode === 'explorer' &&
            displayHotspots.map((hotspot) => (
              <AdvancedMarker
                key={`${hotspot.district}-${hotspot.category}`}
                position={{ lat: hotspot.lat, lng: hotspot.lng }}
                onClick={() => {
                  setActiveHotspot(hotspot);
                  onHotspotClick?.(hotspot);
                }}
                title={`${hotspot.district} Demand Cluster: ${hotspot.category}`}
              >
                <div className="relative flex items-center justify-center cursor-pointer transition transform hover:scale-110">
                  {/* Glowing Radar Waves */}
                  <span className="absolute size-14 rounded-full bg-secondary/20 animate-ping opacity-60" />
                  <span className="absolute size-10 rounded-full bg-secondary/30" />
                  
                  {/* Priority Badge */}
                  <div className="relative z-10 flex size-9 items-center justify-center rounded-full bg-background border-2 border-secondary font-bold text-xs text-highlight shadow-xl">
                    {hotspot.score}
                  </div>
                </div>
              </AdvancedMarker>
            ))}

          {/* Explorer Mode: Public Anonymized Complaints */}
          {mode === 'explorer' &&
            displayComplaints
              .filter((c) => c.latitude && c.longitude)
              .map((c) => (
                <AdvancedMarker
                  key={c.id}
                  position={{ lat: c.latitude!, lng: c.longitude! }}
                  onClick={() => setActiveComplaint(c)}
                  title={`${c.category} - ${c.locality}`}
                >
                  <Pin
                    background={
                      c.category === 'Water Supply'
                        ? '#14b8a6'
                        : c.category === 'Roads & Transport'
                        ? '#06b6d4'
                        : c.category === 'Waste & Sanitation'
                        ? '#f59e0b'
                        : '#8b5cf6'
                    }
                    borderColor="#0f172a"
                    glyphColor="#ffffff"
                    scale={0.85}
                  />
                </AdvancedMarker>
              ))}

          {/* InfoWindow for Active Hotspot */}
          {activeHotspot && (
            <InfoWindow
              position={{ lat: activeHotspot.lat, lng: activeHotspot.lng }}
              onCloseClick={() => setActiveHotspot(null)}
            >
              <div className="p-1 min-w-[220px] text-slate-900">
                <div className="flex items-center justify-between border-b pb-1 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700">
                    {activeHotspot.district} Cluster
                  </span>
                  <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800">
                    Signal {activeHotspot.score}/100
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{activeHotspot.category}</h4>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>{activeHotspot.reports}</strong> related citizen reports
                </p>
                <p className="text-xs text-slate-600">
                  Infrastructure Gap: <strong>{activeHotspot.gap}</strong>
                </p>
                <p className="text-xs text-slate-600">
                  Est. Affected Population: <strong>{activeHotspot.affected}</strong>
                </p>
                <div className="mt-2 text-[10px] text-slate-500 italic">
                  Aggregated public demand cluster • No citizen PII
                </div>
              </div>
            </InfoWindow>
          )}

          {/* InfoWindow for Active Complaint */}
          {activeComplaint && activeComplaint.latitude && activeComplaint.longitude && (
            <InfoWindow
              position={{ lat: activeComplaint.latitude, lng: activeComplaint.longitude }}
              onCloseClick={() => setActiveComplaint(null)}
            >
              <div className="p-1 min-w-[200px] text-slate-900">
                <div className="flex items-center justify-between border-b pb-1 mb-1.5">
                  <span className="text-[10px] font-mono text-slate-500">{activeComplaint.id}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                    {activeComplaint.status}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-slate-900">{activeComplaint.issue}</h5>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {activeComplaint.locality}, {activeComplaint.district}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">{activeComplaint.date}</p>
              </div>
            </InfoWindow>
          )}
        </Map>

        {/* Legend / Overlay Note */}
        <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface/90 px-2.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur-md shadow">
            {mode === 'picker' ? (
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <MapPin className="size-3.5 text-primary" />
                Click map or drag marker to pinpoint exact problem location
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-secondary" /> Hotspot Signals
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-primary" /> Anonymized Complaints
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selected Coordinates Footer in Picker Mode */}
      {mode === 'picker' && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface/80 px-4 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <span className="text-muted-foreground mr-1">District:</span>
              <strong className="text-foreground font-semibold">{selectedDistrictName}</strong>
            </div>
            <div>
              <span className="text-muted-foreground mr-1">Locality:</span>
              <strong className="text-foreground font-semibold">{selectedLocalityName}</strong>
            </div>
            <div>
              <span className="text-muted-foreground mr-1">PIN:</span>
              <strong className="text-foreground font-mono">{selectedPinCode}</strong>
            </div>
            <div className="text-[11px] font-mono text-muted-foreground">
              GPS: {markerPosition.lat.toFixed(4)}° N, {markerPosition.lng.toFixed(4)}° E
            </div>
          </div>

          <span className="text-[11px] text-secondary font-medium">
            ✓ Separate from your residential address
          </span>
        </div>
      )}
    </div>
  );
}
