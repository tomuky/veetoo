'use client';

import { useState } from 'react';
import { CALCULATION_MODES } from '../../lib/constants';
import { formatAddress, formatDate, formatUSD, formatTokenAmount } from '../../lib/formatting';
import { usePrices } from '../../hooks/usePrices';
import { usePositionHistory } from '../../hooks/usePositionHistory';
import { useILCalculation } from '../../hooks/useILCalculation';
import { ExpandIcon, ExternalLinkIcon } from '../icons';
import TokenPair from '../TokenPair';
import TokenIcon from '../TokenIcon';
import ModeToggle from '../ModeToggle';
import MetricsGrid from '../MetricsGrid';
import AssetChanges from '../AssetChanges';
import ILChart from '../ILChart';
import styles from './PositionCard.module.css';

export default function PositionCard({ position, defaultExpanded = false }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [mode, setMode] = useState(CALCULATION_MODES.SINCE_LAST_ACTION);
  
  const tokenAddresses = [position.token0.address, position.token1.address];
  
  const { data: pricesData, isLoading: pricesLoading, error: pricesError } = usePrices(tokenAddresses);
  
  const { data: historyData, isLoading: historyLoading, error: historyError } = usePositionHistory(
    position.pairAddress,
    {
      token0Decimals: position.token0.decimals,
      token1Decimals: position.token1.decimals,
    }
  );
  
  const prices = pricesData ? {
    token0Price: pricesData[position.token0.address.toLowerCase()]?.price || 0,
    token1Price: pricesData[position.token1.address.toLowerCase()]?.price || 0,
  } : null;
  
  const { metrics, entry, loading: calcLoading, error: calcError } = useILCalculation(
    position,
    historyData,
    prices,
    mode
  );
  
  const isLoading = pricesLoading || historyLoading || calcLoading;
  const error = pricesError || historyError || calcError;
  
  const getTrackingLabel = () => {
    if (!entry) return '';
    if (!entry.timestamp) return 'No history found';
    const actionLabel = entry.actionType === 'Mint' ? 'added liquidity' : 'removed liquidity';
    return `Since ${formatDate(entry.timestamp)} (${actionLabel})`;
  };
  
  // Calculate position value using current prices
  const currentValue = prices 
    ? (position.userToken0 * prices.token0Price) + (position.userToken1 * prices.token1Price)
    : 0;
  
  const headerValue = metrics?.positionValue 
    ? formatUSD(metrics.positionValue) 
    : (currentValue > 0 ? formatUSD(currentValue) : '$--');

  return (
    <div className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}>
      <button className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.headerLeft}>
          <TokenPair 
            token0={position.token0} 
            token1={position.token1} 
            size={28}
          />
          <div className={styles.poolName}>
            <span className={styles.pairName}>
              {position.token0.symbol}/{position.token1.symbol}
            </span>
            <span className={styles.pairAddress}>{formatAddress(position.pairAddress)}</span>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.headerValue}>
            <span className={styles.valueLabel}>Value</span>
            <span className={styles.valueAmount}>{headerValue}</span>
          </div>
          {metrics && metrics.netPnLPercent !== undefined && (
            <div className={`${styles.headerPnL} ${metrics.netPnL >= 0 ? styles.positive : styles.negative}`}>
              {metrics.netPnL >= 0 ? '+' : ''}{(metrics.netPnLPercent * 100).toFixed(2)}%
            </div>
          )}
          <ExpandIcon size={18} expanded={isExpanded} className={styles.expandIcon} />
        </div>
      </button>
      
      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.controls}>
            <ModeToggle mode={mode} onModeChange={setMode} disabled={true} />
            <span className={styles.trackingLabel}>
              {isLoading ? 'Loading...' : getTrackingLabel()}
            </span>
          </div>
          
          {error && (
            <div className={styles.error}>
              {typeof error === 'string' ? error : error?.message || 'Error loading data'}
            </div>
          )}
          
          <MetricsGrid metrics={metrics} isLoading={isLoading} />
          
          <div className={styles.details}>
            <div className={styles.detailsGrid}>
              <AssetChanges
                token0={position.token0}
                token1={position.token1}
                entry={entry}
                current={{
                  token0: metrics?.currentToken0 || position.userToken0,
                  token1: metrics?.currentToken1 || position.userToken1,
                }}
                isLoading={isLoading}
              />
              
              <div className={styles.hodlBox}>
                <h4 className={styles.hodlTitle}>If you had just held</h4>
                {entry && entry.token0Amount > 0 ? (
                  <>
                    <p className={styles.hodlValue}>
                      {formatTokenAmount(entry.token0Amount, { decimals: 4 })} {position.token0.symbol} + {formatTokenAmount(entry.token1Amount, { decimals: 2 })} {position.token1.symbol}
                    </p>
                    <p className={styles.hodlAmount}>= {metrics ? formatUSD(metrics.hodlValue) : '--'}</p>
                  </>
                ) : (
                  <p className={styles.hodlValue}>No entry data available</p>
                )}
              </div>
            </div>
            
            <div className={styles.pricesRow}>
              <span className={styles.priceItem}>
                <TokenIcon address={position.token0.address} symbol={position.token0.symbol} size={16} />
                {position.token0.symbol}: {prices?.token0Price ? formatUSD(prices.token0Price) : '--'}
              </span>
              <span className={styles.priceItem}>
                <TokenIcon address={position.token1.address} symbol={position.token1.symbol} size={16} />
                {position.token1.symbol}: {prices?.token1Price ? formatUSD(prices.token1Price) : '--'}
              </span>
              {metrics?.daysInPool !== undefined && metrics.daysInPool > 0 && (
                <span className={styles.priceItem}>
                  Time in pool: {Math.floor(metrics.daysInPool)} days
                </span>
              )}
            </div>
          </div>
          
          <ILChart data={[]} isLoading={false} />
          
          <div className={styles.links}>
            <a 
              href={`https://basescan.org/address/${position.pairAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              View on Basescan <ExternalLinkIcon size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
