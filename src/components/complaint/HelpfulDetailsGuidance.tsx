import React from 'react';
import { CategoryName } from '../../types';
import { Lightbulb, PlusCircle, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HelpfulDetailsGuidanceProps {
  category: CategoryName | string;
  subissue?: string;
  onPromptClick?: (promptText: string) => void;
}

interface CategoryGuidance {
  mainPoints: string[];
  subissueSpecific?: Record<string, string[]>;
}

const GUIDANCE_DATA: Record<string, CategoryGuidance> = {
  'Water Supply': {
    mainPoints: [
      'Since when has the issue occurred?',
      'How frequently does it happen?',
      'Usual water supply timings',
      'Low pressure / no supply / leakage / water-quality concern',
      'Approximate households affected',
    ],
    subissueSpecific: {
      'Pipeline leakage': [
        'Visible pipeline burst, valve leak, or ground seepage?',
        'Estimate of clean water being wasted',
        'Exact street number, pole or meter landmark',
      ],
      'Contaminated water': [
        'Colour, odour, or presence of sand/sediment',
        'Has it caused health symptoms or sickness in the lane?',
        'Whether booster pumps or underground tanks are affected',
      ],
      'Low pressure': [
        'Does water reach ground-floor taps or only with motor?',
        'Morning vs evening supply pressure difference',
      ],
    },
  },
  'Roads & Transport': {
    mainPoints: [
      'Exact location or nearby landmark',
      'Since when the problem has existed',
      'Type/severity of road damage',
      'Effect on traffic or pedestrians',
      'Safety concerns',
      'Nearby school, hospital, market, or major road',
    ],
    subissueSpecific: {
      'Potholes': [
        'Depth and width of potholes (e.g. single large crater vs multiple potholes)',
        'Accidents or vehicle breakdowns witnessed',
        'Is water pooling inside them during rain?',
      ],
      'Broken street lighting': [
        'Which pole number or between which road junctions?',
        'Entire stretch pitch dark or flickering light?',
        'Pedestrian safety risk for women/elderly at night',
      ],
      'Traffic congestion': [
        'Peak hours when gridlock occurs',
        'Encroachment, illegal parking, or junction bottleneck',
      ],
    },
  },
  'Waste & Sanitation': {
    mainPoints: [
      'Exact location',
      'Since when waste/sewage has accumulated',
      'Frequency of the problem',
      'Overflow / blockage / drainage / waterlogging',
      'Odour or pollution concerns',
      'People/households affected',
    ],
    subissueSpecific: {
      'Sewage blockage': [
        'Manhole overflowing onto pedestrian pavement or street?',
        'Backflow entering residential drains or basements',
        'Urgent mosquito or disease hazard',
      ],
      'Drainage / waterlogging': [
        'Water depth after rainfall and drainage stagnation duration',
        'Are school routes or metro station access blocked?',
      ],
      'Garbage accumulation': [
        'Designated dhalao overflowing or open roadside dumping?',
        'Stray animals dispersing waste',
      ],
    },
  },
  'Electricity & Digital Connectivity': {
    mainPoints: [
      'Exact location',
      'Since when the issue has occurred',
      'Duration/frequency',
      'Electricity / streetlight / mobile connectivity / internet connectivity',
      'Area affected',
      'Impact on residents or businesses',
    ],
    subissueSpecific: {
      'Power outage': [
        'Frequent tripping, transformer sparking, or complete blackout?',
        'Low voltage damaging home appliances',
        'Number of buildings or lanes without electricity',
      ],
      'Streetlight failure': [
        'Specific street or park walkway',
        'Since how many weeks or months lights have been off',
      ],
      'Poor mobile connectivity': [
        'Call drops inside homes vs outdoors',
        'Specific telecom network carriers affected',
      ],
    },
  },
};

export function HelpfulDetailsGuidance({
  category,
  subissue,
  onPromptClick,
}: HelpfulDetailsGuidanceProps) {
  const currentCategoryData = GUIDANCE_DATA[category] || GUIDANCE_DATA['Water Supply'];
  const specificPoints =
    (subissue && currentCategoryData.subissueSpecific?.[subissue]) || [];

  return (
    <div className="rounded-lg border border-border/70 bg-surface/50 p-3.5 space-y-2.5 transition-all">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-secondary shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider text-secondary">
          Helpful details to include ({category})
        </span>
        {subissue && (
          <span className="text-[11px] text-muted-foreground ml-auto hidden sm:inline">
            Focus: <strong className="text-foreground">{subissue}</strong>
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Mentioning these specific details helps field teams verify and prioritize the issue faster:
      </p>

      {/* Main Guidance Points */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {currentCategoryData.mainPoints.map((point) => (
          <button
            key={point}
            type="button"
            onClick={() => onPromptClick?.(point)}
            title="Click to insert prompt note into description"
            className={cn(
              'group flex items-center gap-1.5 rounded-md border border-border/80 bg-background/80 px-2.5 py-1 text-xs text-foreground/90 transition hover:border-secondary/60 hover:bg-secondary/10 hover:text-secondary cursor-pointer'
            )}
          >
            <span className="text-secondary/70 group-hover:text-secondary">•</span>
            <span>{point}</span>
            {onPromptClick && (
              <PlusCircle className="size-3 text-muted-foreground opacity-40 group-hover:opacity-100 transition ml-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* Subissue Specific Hints (if available) */}
      {specificPoints.length > 0 && (
        <div className="border-t border-border/50 pt-2 space-y-1">
          <span className="text-[11px] font-semibold text-primary block">
            Specific to {subissue}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {specificPoints.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onPromptClick?.(item)}
                className="group flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs text-foreground/85 hover:border-primary hover:bg-primary/10 transition cursor-pointer"
              >
                <span className="text-primary">•</span>
                <span>{item}</span>
                {onPromptClick && (
                  <PlusCircle className="size-3 text-primary opacity-40 group-hover:opacity-100 transition ml-0.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
