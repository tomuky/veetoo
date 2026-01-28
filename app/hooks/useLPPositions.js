'use client';

import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { formatUnits, parseAbiItem } from 'viem';
import { UNISWAP_V2_ADDRESSES, CHAINS } from '../lib/constants';
import { UNISWAP_V2_PAIR_ABI, ERC20_ABI, UNISWAP_V2_FACTORY_ABI } from '../lib/contracts';
import { useActiveAddress } from './useActiveAddress';

/**
 * Hook to discover and fetch user's Uniswap V2 LP positions
 * 
 * @returns {Object} Query result with LP positions
 */
export function useLPPositions() {
  const { address } = useActiveAddress();
  const publicClient = usePublicClient();
  
  return useQuery({
    queryKey: ['lpPositions', address],
    queryFn: async () => {
      if (!address || !publicClient) {
        return [];
      }
      
      // Strategy: Query Transfer events where user received LP tokens
      // This catches both mints and transfers from other addresses
      const factoryAddress = UNISWAP_V2_ADDRESSES.base.factory;
      
      // First, get all pairs from factory by looking at PairCreated events
      // In production, you'd want to use an indexer or cache this
      // For now, we'll look for Transfer events to the user from any V2 pair
      
      // Get Transfer events to the user (LP token receipts)
      const transferLogs = await publicClient.getLogs({
        event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
        args: {
          to: address,
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });
      
      // Get unique pair addresses that sent tokens to user
      const potentialPairs = [...new Set(transferLogs.map(log => log.address.toLowerCase()))];
      
      // Filter to only valid V2 pairs by checking if they have the required functions
      const validPairs = [];
      
      for (const pairAddress of potentialPairs) {
        try {
          // Check if this is a V2 pair by calling token0()
          const token0 = await publicClient.readContract({
            address: pairAddress,
            abi: UNISWAP_V2_PAIR_ABI,
            functionName: 'token0',
          });
          
          // If it has token0, it's likely a V2 pair
          // Now check if user has a balance
          const balance = await publicClient.readContract({
            address: pairAddress,
            abi: UNISWAP_V2_PAIR_ABI,
            functionName: 'balanceOf',
            args: [address],
          });
          
          if (balance > 0n) {
            validPairs.push({
              address: pairAddress,
              balance,
            });
          }
        } catch {
          // Not a V2 pair or call failed, skip
          continue;
        }
      }
      
      // Fetch full details for each valid pair
      const positions = await Promise.all(
        validPairs.map(async ({ address: pairAddress, balance }) => {
          try {
            // Fetch pair data
            const [token0, token1, reserves, totalSupply] = await Promise.all([
              publicClient.readContract({
                address: pairAddress,
                abi: UNISWAP_V2_PAIR_ABI,
                functionName: 'token0',
              }),
              publicClient.readContract({
                address: pairAddress,
                abi: UNISWAP_V2_PAIR_ABI,
                functionName: 'token1',
              }),
              publicClient.readContract({
                address: pairAddress,
                abi: UNISWAP_V2_PAIR_ABI,
                functionName: 'getReserves',
              }),
              publicClient.readContract({
                address: pairAddress,
                abi: UNISWAP_V2_PAIR_ABI,
                functionName: 'totalSupply',
              }),
            ]);
            
            // Fetch token metadata
            const [token0Data, token1Data] = await Promise.all([
              fetchTokenData(publicClient, token0),
              fetchTokenData(publicClient, token1),
            ]);
            
            // Calculate user's share
            const userShare = Number(balance) / Number(totalSupply);
            const userToken0 = Number(formatUnits(reserves[0], token0Data.decimals)) * userShare;
            const userToken1 = Number(formatUnits(reserves[1], token1Data.decimals)) * userShare;
            
            return {
              pairAddress,
              token0: {
                address: token0,
                ...token0Data,
              },
              token1: {
                address: token1,
                ...token1Data,
              },
              lpBalance: balance,
              lpBalanceFormatted: formatUnits(balance, 18),
              totalSupply,
              reserves: {
                reserve0: reserves[0],
                reserve1: reserves[1],
                reserve0Formatted: formatUnits(reserves[0], token0Data.decimals),
                reserve1Formatted: formatUnits(reserves[1], token1Data.decimals),
              },
              userShare,
              userToken0,
              userToken1,
              k: Number(reserves[0]) * Number(reserves[1]),
            };
          } catch (error) {
            console.error(`Error fetching position for ${pairAddress}:`, error);
            return null;
          }
        })
      );
      
      return positions.filter(Boolean);
    },
    enabled: !!address && !!publicClient,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Helper to fetch token metadata
 */
async function fetchTokenData(publicClient, tokenAddress) {
  try {
    const [name, symbol, decimals] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'name',
      }),
      publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      publicClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ]);
    
    return { name, symbol, decimals };
  } catch (error) {
    // Fallback for non-standard tokens
    return {
      name: 'Unknown Token',
      symbol: '???',
      decimals: 18,
    };
  }
}
