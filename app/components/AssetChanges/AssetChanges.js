'use client';

import { formatTokenAmount, getValueClass } from '../../lib/formatting';
import TokenIcon from '../TokenIcon';
import styles from './AssetChanges.module.css';

export default function AssetChanges({ 
  token0, 
  token1, 
  entry, 
  current, 
  isLoading 
}) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!entry || !current) {
    return null;
  }

  const token0Change = current.token0 - entry.token0Amount;
  const token1Change = current.token1 - entry.token1Amount;

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Asset Changes</h4>
      <p className={styles.subtitle}>vs. entry position</p>
      
      <div className={styles.assets}>
        <div className={styles.asset}>
          <div className={styles.assetHeader}>
            <TokenIcon address={token0?.address} symbol={token0?.symbol} size={18} />
            <span className={styles.symbol}>{token0?.symbol || 'Token0'}</span>
          </div>
          <div className={styles.assetValues}>
            <span className={styles.entryValue}>
              {formatTokenAmount(entry.token0Amount)}
            </span>
            <span className={styles.arrow}>→</span>
            <span className={styles.currentValue}>
              {formatTokenAmount(current.token0)}
            </span>
            <span className={`${styles.changeValue} ${getValueClass(token0Change)}`}>
              ({token0Change >= 0 ? '+' : ''}{formatTokenAmount(token0Change)})
            </span>
          </div>
        </div>
        
        <div className={styles.asset}>
          <div className={styles.assetHeader}>
            <TokenIcon address={token1?.address} symbol={token1?.symbol} size={18} />
            <span className={styles.symbol}>{token1?.symbol || 'Token1'}</span>
          </div>
          <div className={styles.assetValues}>
            <span className={styles.entryValue}>
              {formatTokenAmount(entry.token1Amount)}
            </span>
            <span className={styles.arrow}>→</span>
            <span className={styles.currentValue}>
              {formatTokenAmount(current.token1)}
            </span>
            <span className={`${styles.changeValue} ${getValueClass(token1Change)}`}>
              ({token1Change >= 0 ? '+' : ''}{formatTokenAmount(token1Change)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
