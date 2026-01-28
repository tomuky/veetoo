/**
 * IL and fee calculation utilities
 */

import { TIME } from './constants';

/**
 * Calculate the pure impermanent loss multiplier based on price ratio change
 */
export function calculateILMultiplier(priceRatioChange) {
  if (priceRatioChange <= 0) return 1;
  return (2 * Math.sqrt(priceRatioChange)) / (1 + priceRatioChange);
}

/**
 * Calculate pure IL as a percentage
 */
export function calculatePureILPercent(priceRatioChange) {
  return calculateILMultiplier(priceRatioChange) - 1;
}

/**
 * Calculate all position metrics
 */
export function calculatePositionMetrics(entry, current) {
  // User's share of the pool
  const userShare = current.lpTokens / current.totalSupply;
  
  // Current token amounts based on pool share
  const currentToken0 = userShare * current.reserve0;
  const currentToken1 = userShare * current.reserve1;
  
  // Current position value
  const positionValue = (currentToken0 * current.price0) + (currentToken1 * current.price1);
  
  // HODL value (what entry tokens would be worth now)
  const hodlValue = (entry.token0Amount * current.price0) + (entry.token1Amount * current.price1);
  
  // Price ratios for IL calculation
  const entryPriceRatio = entry.token1Amount / entry.token0Amount;
  const currentPriceRatio = current.reserve1 / current.reserve0;
  const priceRatioChange = currentPriceRatio / entryPriceRatio;
  
  // Pure IL calculation
  const ilMultiplier = calculateILMultiplier(priceRatioChange);
  const pureILPercent = ilMultiplier - 1;
  const pureILValue = hodlValue * pureILPercent;
  
  // Value if only IL occurred (no fees)
  const valueWithOnlyIL = hodlValue * ilMultiplier;
  
  // Fees earned = actual value - value if no fees
  const feesEarned = positionValue - valueWithOnlyIL;
  const feesEarnedPercent = hodlValue > 0 ? feesEarned / hodlValue : 0;
  
  // Net P&L (LP vs HODL)
  const netPnL = positionValue - hodlValue;
  const netPnLPercent = hodlValue > 0 ? netPnL / hodlValue : 0;
  
  // Token changes
  const token0Change = currentToken0 - entry.token0Amount;
  const token1Change = currentToken1 - entry.token1Amount;
  
  // Time in pool
  const now = Date.now();
  const timeInPool = entry.timestamp ? now - entry.timestamp : 0;
  const daysInPool = timeInPool / TIME.DAY;
  
  // Annualized APY
  const yearsInPool = timeInPool / TIME.YEAR;
  const realizedAPY = yearsInPool > 0 
    ? Math.pow(1 + Math.abs(netPnLPercent), 1 / yearsInPool) - 1
    : 0;
  
  return {
    positionValue,
    hodlValue,
    netPnL,
    netPnLPercent,
    pureIL: pureILValue,
    pureILPercent,
    feesEarned,
    feesEarnedPercent,
    currentToken0,
    currentToken1,
    token0Change,
    token1Change,
    timeInPool,
    daysInPool,
    realizedAPY: netPnLPercent >= 0 ? realizedAPY : -realizedAPY,
    ilMultiplier,
    priceRatioChange,
    userShare,
  };
}

/**
 * Calculate entry state from full history of events
 */
export function calculateFullHistoryEntry(events) {
  if (!events || events.length === 0) return null;
  
  let totalToken0In = 0;
  let totalToken1In = 0;
  let totalToken0Out = 0;
  let totalToken1Out = 0;
  let weightedK = 0;
  let totalLPWeight = 0;
  let firstTimestamp = null;
  let eventCount = { mints: 0, burns: 0 };
  
  for (const event of events) {
    if (event.type === 'Mint') {
      totalToken0In += event.amount0;
      totalToken1In += event.amount1;
      weightedK += (event.k || 0) * (event.lpAmount || 1);
      totalLPWeight += event.lpAmount || 1;
      eventCount.mints++;
      
      if (!firstTimestamp || event.timestamp < firstTimestamp) {
        firstTimestamp = event.timestamp;
      }
    } else if (event.type === 'Burn') {
      totalToken0Out += event.amount0;
      totalToken1Out += event.amount1;
      eventCount.burns++;
    }
  }
  
  const netToken0 = totalToken0In - totalToken0Out;
  const netToken1 = totalToken1In - totalToken1Out;
  const avgK = totalLPWeight > 0 ? weightedK / totalLPWeight : 0;
  
  return {
    token0Amount: Math.max(netToken0, 0),
    token1Amount: Math.max(netToken1, 0),
    k: avgK,
    timestamp: firstTimestamp,
    eventCount,
  };
}

/**
 * Calculate entry state from the last action only
 */
export function calculateSinceLastActionEntry(events) {
  if (!events || events.length === 0) return null;
  
  // Get the most recent event
  const sortedEvents = [...events].sort((a, b) => b.blockNumber - a.blockNumber);
  const lastAction = sortedEvents[0];
  
  if (!lastAction) return null;
  
  return {
    token0Amount: lastAction.amount0 || 0,
    token1Amount: lastAction.amount1 || 0,
    k: lastAction.k || 0,
    timestamp: lastAction.timestamp,
    actionType: lastAction.type,
  };
}

/**
 * Generate daily IL breakdown for charting
 */
export function generateDailyILBreakdown(dailySnapshots) {
  if (!dailySnapshots || dailySnapshots.length === 0) return [];
  
  return dailySnapshots.map((snapshot, index) => {
    const prevSnapshot = index > 0 ? dailySnapshots[index - 1] : null;
    
    const dailyIL = prevSnapshot 
      ? snapshot.pureIL - prevSnapshot.pureIL 
      : snapshot.pureIL;
    
    const dailyFees = prevSnapshot
      ? snapshot.feesEarned - prevSnapshot.feesEarned
      : snapshot.feesEarned;
    
    return {
      date: snapshot.date,
      timestamp: snapshot.timestamp,
      pureIL: dailyIL,
      feesEarned: dailyFees,
      netChange: dailyIL + dailyFees,
      cumulativeIL: snapshot.pureIL,
      cumulativeFees: snapshot.feesEarned,
      cumulativeNet: snapshot.netPnL,
    };
  });
}
