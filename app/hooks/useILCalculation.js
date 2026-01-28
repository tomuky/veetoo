'use client';

import { useMemo } from 'react';
import { CALCULATION_MODES } from '../lib/constants';
import { 
  calculatePositionMetrics, 
  calculateFullHistoryEntry, 
  calculateSinceLastActionEntry 
} from '../lib/calculations';

/**
 * Hook to calculate IL metrics for a position
 * 
 * @param {Object} position - Position data from useLPPositions
 * @param {Object} history - Event history from usePositionHistory
 * @param {Object} prices - Token prices { token0Price, token1Price }
 * @param {string} mode - Calculation mode ('fullHistory' or 'sinceLastAction')
 * @returns {Object} Calculated metrics
 */
export function useILCalculation(position, history, prices, mode = CALCULATION_MODES.FULL_HISTORY) {
  return useMemo(() => {
    if (!position || !history?.events?.length || !prices?.token0Price || !prices?.token1Price) {
      return {
        loading: !position || !history,
        error: null,
        metrics: null,
        entry: null,
      };
    }
    
    try {
      // Calculate entry state based on mode
      let entry;
      
      if (mode === CALCULATION_MODES.FULL_HISTORY) {
        entry = calculateFullHistoryEntry(history.events);
      } else {
        // For since last action, we need to know position state after burns
        // This is a simplified version - in production you'd track LP tokens at each event
        entry = calculateSinceLastActionEntry(history.events);
      }
      
      if (!entry || entry.token0Amount <= 0 || entry.token1Amount <= 0) {
        return {
          loading: false,
          error: 'Unable to calculate entry state',
          metrics: null,
          entry: null,
        };
      }
      
      // Current state from position
      const current = {
        lpTokens: Number(position.lpBalanceFormatted),
        totalSupply: Number(position.totalSupply) / 1e18, // LP tokens have 18 decimals
        reserve0: Number(position.reserves.reserve0Formatted),
        reserve1: Number(position.reserves.reserve1Formatted),
        price0: prices.token0Price,
        price1: prices.token1Price,
      };
      
      // Calculate metrics
      const metrics = calculatePositionMetrics(entry, current);
      
      return {
        loading: false,
        error: null,
        metrics,
        entry: {
          ...entry,
          mode,
        },
      };
    } catch (error) {
      console.error('IL calculation error:', error);
      return {
        loading: false,
        error: error.message,
        metrics: null,
        entry: null,
      };
    }
  }, [position, history, prices, mode]);
}

/**
 * Hook that provides both calculation modes for easy toggling
 * 
 * @param {Object} position - Position data
 * @param {Object} history - Event history
 * @param {Object} prices - Token prices
 * @returns {Object} Both calculation results and helper info
 */
export function useILCalculationModes(position, history, prices) {
  const fullHistory = useILCalculation(
    position, 
    history, 
    prices, 
    CALCULATION_MODES.FULL_HISTORY
  );
  
  const sinceLastAction = useILCalculation(
    position, 
    history, 
    prices, 
    CALCULATION_MODES.SINCE_LAST_ACTION
  );
  
  return useMemo(() => {
    // Check if modes would give different results
    const hasModesDifference = history?.events?.length > 1;
    
    return {
      fullHistory,
      sinceLastAction,
      hasModesDifference,
      eventCount: history?.events?.length || 0,
      mintCount: history?.mintCount || 0,
      burnCount: history?.burnCount || 0,
    };
  }, [fullHistory, sinceLastAction, history]);
}
