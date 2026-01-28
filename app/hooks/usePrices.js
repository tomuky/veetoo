'use client';

import { useQuery } from '@tanstack/react-query';
import { DEFILLAMA_API, CHAINS } from '../lib/constants';

/**
 * Fetch current prices for tokens from DeFiLlama
 * 
 * @param {Array<string>} tokenAddresses - Array of token addresses
 * @param {string} chain - Chain name (e.g., 'base')
 * @returns {Object} Query result with prices
 */
export function usePrices(tokenAddresses, chain = 'base') {
  return useQuery({
    queryKey: ['prices', chain, tokenAddresses],
    queryFn: async () => {
      if (!tokenAddresses || tokenAddresses.length === 0) {
        return {};
      }
      
      // Format tokens for DeFiLlama API: chain:address
      const coins = tokenAddresses.map(addr => `${chain}:${addr}`).join(',');
      const url = `${DEFILLAMA_API.baseUrl}${DEFILLAMA_API.prices.current}/${coins}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      
      const data = await response.json();
      
      // Transform response to { address: { price, symbol, decimals } }
      const prices = {};
      for (const [key, value] of Object.entries(data.coins || {})) {
        const address = key.split(':')[1]?.toLowerCase();
        if (address) {
          prices[address] = {
            price: value.price,
            symbol: value.symbol,
            decimals: value.decimals,
            confidence: value.confidence,
          };
        }
      }
      
      return prices;
    },
    enabled: tokenAddresses && tokenAddresses.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Fetch historical price at a specific timestamp
 * 
 * @param {string} tokenAddress - Token address
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {string} chain - Chain name
 * @returns {Object} Query result with historical price
 */
export function useHistoricalPrice(tokenAddress, timestamp, chain = 'base') {
  return useQuery({
    queryKey: ['historicalPrice', chain, tokenAddress, timestamp],
    queryFn: async () => {
      if (!tokenAddress || !timestamp) {
        return null;
      }
      
      const coin = `${chain}:${tokenAddress}`;
      const url = `${DEFILLAMA_API.baseUrl}${DEFILLAMA_API.prices.historical}/${timestamp}/${coin}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch historical price');
      }
      
      const data = await response.json();
      const priceData = data.coins?.[coin];
      
      return priceData ? {
        price: priceData.price,
        symbol: priceData.symbol,
        timestamp: priceData.timestamp,
      } : null;
    },
    enabled: !!tokenAddress && !!timestamp,
    staleTime: Infinity, // Historical prices don't change
  });
}

/**
 * Batch fetch historical prices for multiple timestamps
 * 
 * @param {string} tokenAddress - Token address
 * @param {Array<number>} timestamps - Array of Unix timestamps in seconds
 * @param {string} chain - Chain name
 * @returns {Object} Query result with historical prices
 */
export function useHistoricalPrices(tokenAddress, timestamps, chain = 'base') {
  return useQuery({
    queryKey: ['historicalPrices', chain, tokenAddress, timestamps],
    queryFn: async () => {
      if (!tokenAddress || !timestamps || timestamps.length === 0) {
        return {};
      }
      
      const coin = `${chain}:${tokenAddress}`;
      
      // Fetch prices for all timestamps in parallel
      const promises = timestamps.map(async (timestamp) => {
        const url = `${DEFILLAMA_API.baseUrl}${DEFILLAMA_API.prices.historical}/${timestamp}/${coin}`;
        const response = await fetch(url);
        if (!response.ok) return { timestamp, price: null };
        const data = await response.json();
        return {
          timestamp,
          price: data.coins?.[coin]?.price || null,
        };
      });
      
      const results = await Promise.all(promises);
      
      // Transform to { timestamp: price }
      const prices = {};
      for (const { timestamp, price } of results) {
        prices[timestamp] = price;
      }
      
      return prices;
    },
    enabled: !!tokenAddress && timestamps && timestamps.length > 0,
    staleTime: Infinity,
  });
}
