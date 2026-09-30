import React from 'react';
import { cn } from '../../lib/utils';
import { DistrictName } from '../../types';

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (React.ReactNode | string)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-background text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="bg-surface transition hover:bg-accent/50">
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={cn(
                    'px-4 py-4',
                    cIdx === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CategoryBars({
  values,
  labels,
}: {
  values: number[];
  labels: string[];
}) {
  return (
    <div className="space-y-4">
      {values.map((val, idx) => (
        <div key={labels[idx] || idx}>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="truncate pr-3 text-muted-foreground">{labels[idx]}</span>
            <span className="font-bold text-foreground">{val}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background">
            <div
              className={cn('h-full rounded-full transition-all duration-500', idx % 2 ? 'bg-secondary' : 'bg-primary')}
              style={{ width: `${val}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${90 - ((v - min) / range) * 68}`)
    .join(' ');

  return (
    <div className="h-52 w-full flex flex-col justify-between">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <g className="text-border" stroke="currentColor" strokeWidth="0.4">
          {[20, 40, 60, 80].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} />
          ))}
        </g>
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          className="text-secondary"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {values.map((v, i) => {
          const cx = (i / (values.length - 1)) * 100;
          const cy = 90 - ((v - min) / range) * 68;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="2"
              fill="currentColor"
              className="text-primary"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
        <span>Sep</span>
      </div>
    </div>
  );
}

export function DistrictMap({
  selected,
  onSelect,
  clusters = true,
}: {
  selected?: DistrictName | string;
  onSelect?: (district: DistrictName) => void;
  clusters?: boolean;
}) {
  const districts: { n: DistrictName; x: number; y: number; s: number }[] = [
    { n: 'North Delhi', x: 36, y: 24, s: 58 },
    { n: 'South Delhi', x: 48, y: 72, s: 48 },
    { n: 'East Delhi', x: 72, y: 48, s: 66 },
  ];

  return (
    <div className="map-grid relative min-h-[320px] overflow-hidden rounded-lg border border-border bg-background">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full opacity-50"
        aria-label="Stylized aggregated Delhi demand map"
      >
        <path
          d="M48 7 66 18 73 35 88 51 74 68 61 91 39 85 28 65 12 51 23 31 31 14Z"
          fill="none"
          stroke="currentColor"
          className="text-secondary"
          strokeWidth="0.7"
        />
        <path
          d="M31 14 48 42 73 35M12 51l36-9 26 26M48 42 39 85"
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth="0.4"
        />
      </svg>

      {districts.map((d) => (
        <button
          key={d.n}
          type="button"
          onClick={() => onSelect?.(d.n)}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-left cursor-pointer transition transform hover:scale-110"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
          aria-label={`Select ${d.n}`}
        >
          <span
            className={cn(
              'block animate-pulse rounded-full border border-secondary/60 bg-secondary/20',
              selected === d.n && 'border-primary bg-primary/30 ring-2 ring-primary/40'
            )}
            style={{ width: clusters ? d.s : 26, height: clusters ? d.s : 26 }}
          />
          <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-foreground bg-background/80 px-1 rounded shadow">
            {d.n}
          </span>
        </button>
      ))}

      <span className="absolute bottom-3 left-3 rounded-md border border-border bg-surface/90 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
        Aggregated demand clusters • No personal locations
      </span>
    </div>
  );
}
