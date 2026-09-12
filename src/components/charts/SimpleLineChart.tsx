import React, { useState } from 'react';
import { TimeSeriesPoint } from '../../types';

interface SimpleLineChartProps {
  data: TimeSeriesPoint[];
  metricKey?: 'views' | 'reach' | 'engagement' | 'followersGained';
  title?: string;
  color?: string;
  height?: number;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  metricKey = 'views',
  title = 'Performance Trend',
  color = '#3b82f6', // blue-500
  height = 220,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-500 text-sm">
        No time-series data available for this range
      </div>
    );
  }

  const values = data.map((d) => d[metricKey] || 0);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = 700;
  const chartHeight = height;

  const getX = (index: number) => {
    if (data.length <= 1) return chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return chartHeight - paddingY - ((val - minVal) / range) * (chartHeight - paddingY * 2);
  };

  // Generate SVG path
  const points = data.map((d, i) => `${getX(i)},${getY(d[metricKey] || 0)}`).join(' ');
  const linePath = `M ${points}`;
  
  // Area fill path
  const areaPath = `M ${getX(0)},${chartHeight - paddingY} ${points} L ${getX(data.length - 1)},${chartHeight - paddingY} Z`;

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="w-full bg-slate-800/80 rounded-2xl border border-slate-700/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h4>
          <p className="text-xs text-slate-400">
            {metricKey.toUpperCase()} across {data.length} recorded day{data.length > 1 ? 's' : ''}
          </p>
        </div>

        {hoveredPoint && (
          <div className="flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs shadow">
            <span className="text-slate-400 font-medium">{hoveredPoint.date}</span>
            <span className="font-bold text-blue-400">
              {(hoveredPoint[metricKey] || 0).toLocaleString()} {metricKey}
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={chartWidth - paddingX}
            y2={paddingY}
            stroke="#334155"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={chartHeight / 2}
            x2={chartWidth - paddingX}
            y2={chartHeight / 2}
            stroke="#334155"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="#334155"
          />

          {/* Y Axis min & max labels */}
          <text x={paddingX - 8} y={paddingY + 4} fill="#64748b" fontSize="10" textAnchor="end">
            {maxVal >= 1000 ? `${(maxVal / 1000).toFixed(1)}k` : maxVal}
          </text>
          <text x={paddingX - 8} y={chartHeight - paddingY} fill="#64748b" fontSize="10" textAnchor="end">
            0
          </text>

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#grad-${metricKey})`} />

          {/* Line */}
          <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d[metricKey] || 0);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#ffffff' : color}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all cursor-pointer"
                />
                {/* Hit area */}
                <rect
                  x={cx - 15}
                  y={0}
                  width={30}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* X Axis Date labels */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 px-6">
          <span>{data[0]?.date}</span>
          {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.date}</span>}
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
};
