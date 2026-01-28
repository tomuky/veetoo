'use client';

import { useState } from 'react';
import { getTokenLogoUrl, getTokenFallbackAvatar } from '../../lib/tokenLogos';
import styles from './TokenIcon.module.css';

export default function TokenIcon({ 
  address, 
  symbol, 
  size = 24, 
  className = '' 
}) {
  const [hasError, setHasError] = useState(false);
  
  const logoUrl = getTokenLogoUrl(address);
  const fallbackUrl = getTokenFallbackAvatar(symbol);
  
  const imgSrc = hasError ? fallbackUrl : (logoUrl || fallbackUrl);
  
  return (
    <div 
      className={`${styles.container} ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={imgSrc}
        alt={symbol || 'Token'}
        className={styles.image}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
}
