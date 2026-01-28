'use client';

import TokenIcon from '../TokenIcon';
import styles from './TokenPair.module.css';

export default function TokenPair({ 
  token0, 
  token1, 
  size = 28,
  className = '' 
}) {
  return (
    <div className={`${styles.container} ${className}`}>
      <TokenIcon 
        address={token0?.address} 
        symbol={token0?.symbol} 
        size={size}
        className={styles.token0}
      />
      <TokenIcon 
        address={token1?.address} 
        symbol={token1?.symbol} 
        size={size}
        className={styles.token1}
      />
    </div>
  );
}
