'use client';

import { useLPPositions } from '../../hooks/useLPPositions';
import { useActiveAddress } from '../../hooks/useActiveAddress';
import { LoadingIcon, PoolIcon } from '../icons';
import PositionCard from '../PositionCard';
import styles from './PositionList.module.css';

export default function PositionList() {
  const { address, source } = useActiveAddress();
  const { data: positions, isLoading, error } = useLPPositions();
  
  if (!address) {
    return (
      <div className={styles.empty}>
        <PoolIcon size={40} className={styles.emptyIcon} />
        <p className={styles.emptyText}>
          Connect wallet or enter an address to view LP positions
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <LoadingIcon size={24} className={styles.loadingIcon} />
        <p className={styles.loadingText}>Searching for LP positions...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.error}>
        <p className={styles.errorTitle}>Error loading positions</p>
        <p className={styles.errorText}>{error.message}</p>
      </div>
    );
  }
  
  if (!positions || positions.length === 0) {
    return (
      <div className={styles.empty}>
        <PoolIcon size={40} className={styles.emptyIcon} />
        <p className={styles.emptyText}>
          No Uniswap V2 LP positions found on Base
        </p>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Positions</span>
        <span className={styles.count}>{positions.length}</span>
      </div>
      
      <div className={styles.list}>
        {positions.map((position) => (
          <PositionCard 
            key={position.pairAddress}
            position={position}
            defaultExpanded={false}
          />
        ))}
      </div>
    </div>
  );
}
