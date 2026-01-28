'use client';

import { formatUSD, formatPercent, getValueClass } from '../../lib/formatting';
import styles from './MetricsGrid.module.css';

export default function MetricsGrid({ metrics, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.card} ${styles.loading}`}>
            <div className={styles.labelSkeleton} />
            <div className={styles.valueSkeleton} />
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const items = [
    {
      label: 'Position Value',
      value: formatUSD(metrics.positionValue),
      subValue: null,
      valueClass: '',
    },
    {
      label: 'LP vs HODL',
      value: formatUSD(metrics.netPnL, { showSign: true }),
      subValue: formatPercent(metrics.netPnLPercent),
      valueClass: getValueClass(metrics.netPnL),
    },
    {
      label: 'Pure IL',
      value: formatUSD(metrics.pureIL, { showSign: true }),
      subValue: formatPercent(metrics.pureILPercent),
      valueClass: getValueClass(metrics.pureIL),
    },
    {
      label: 'Fees Earned',
      value: formatUSD(metrics.feesEarned, { showSign: true }),
      subValue: formatPercent(metrics.feesEarnedPercent),
      valueClass: getValueClass(metrics.feesEarned),
    },
  ];

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item.label} className={styles.card}>
          <span className={styles.label}>{item.label}</span>
          <span className={`${styles.value} ${item.valueClass}`}>
            {item.value}
          </span>
          {item.subValue && (
            <span className={`${styles.subValue} ${item.valueClass}`}>
              {item.subValue}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
