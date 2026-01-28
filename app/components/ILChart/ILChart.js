'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { formatUSD, formatDate } from '../../lib/formatting';
import styles from './ILChart.module.css';

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>{label}</p>
      {payload.map((entry, index) => (
        <p 
          key={index} 
          className={styles.tooltipItem}
          style={{ color: entry.color }}
        >
          <span className={styles.tooltipLabel}>{entry.name}:</span>
          <span className={styles.tooltipValue}>{formatUSD(entry.value, { showSign: true })}</span>
        </p>
      ))}
    </div>
  );
}

export default function ILChart({ data, isLoading }) {
  // Transform data for the chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((point) => ({
      date: formatDate(point.timestamp),
      timestamp: point.timestamp,
      'Pure IL': point.pureIL,
      'Fees Earned': point.feesEarned,
      'Net Change': point.netChange,
      'Cumulative Net': point.cumulativeNet,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>No historical data available for chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>Performance Over Time</h4>
      </div>
      
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--color-border-light)" 
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatUSD(value, { compact: true })}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 20 }}
              iconType="circle"
            />
            <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="3 3" />
            
            {/* Bar chart for daily IL */}
            <Bar 
              dataKey="Pure IL" 
              fill="var(--color-negative)" 
              fillOpacity={0.6}
              radius={[2, 2, 0, 0]}
            />
            
            {/* Bar chart for daily fees */}
            <Bar 
              dataKey="Fees Earned" 
              fill="var(--color-positive)" 
              fillOpacity={0.6}
              radius={[2, 2, 0, 0]}
            />
            
            {/* Line for cumulative net */}
            <Line 
              type="monotone" 
              dataKey="Cumulative Net" 
              stroke="var(--color-accent)" 
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
