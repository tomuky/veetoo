'use client';

import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';
import { parseAbiItem, formatUnits } from 'viem';
import { useActiveAddress } from './useActiveAddress';

/**
 * Query logs in chunks to avoid RPC block range limits
 */
async function queryLogsInChunks(publicClient, params, chunkSize = 40000n) {
  const currentBlock = await publicClient.getBlockNumber();
  const startBlock = 0n;
  const results = [];
  
  // Query in chunks from recent to old, stop after finding events or reaching limit
  let toBlock = currentBlock;
  let chunksQueried = 0;
  const maxChunks = 10; // Limit how far back we go
  
  while (toBlock > startBlock && chunksQueried < maxChunks) {
    const fromBlock = toBlock - chunkSize > startBlock ? toBlock - chunkSize : startBlock;
    
    try {
      const logs = await publicClient.getLogs({
        ...params,
        fromBlock,
        toBlock,
      });
      results.push(...logs);
    } catch (e) {
      console.warn('Log query failed for range:', fromBlock, toBlock, e.message);
    }
    
    toBlock = fromBlock - 1n;
    chunksQueried++;
    
    // If we found events, we can stop
    if (results.length > 0) break;
  }
  
  return results;
}

/**
 * Hook to fetch historical LP token transfers for a user's position
 */
export function usePositionHistory(pairAddress, tokenInfo) {
  const { address } = useActiveAddress();
  const publicClient = usePublicClient();
  
  return useQuery({
    queryKey: ['positionHistory', pairAddress, address],
    queryFn: async () => {
      if (!address || !pairAddress || !publicClient) {
        return { events: [], firstTimestamp: null, lastTimestamp: null };
      }
      
      const { token0Decimals = 18, token1Decimals = 18 } = tokenInfo || {};
      
      // Get LP token transfers TO the user (mints/receives)
      const transfersIn = await queryLogsInChunks(publicClient, {
        address: pairAddress,
        event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
        args: { to: address },
      });
      
      // Get LP token transfers FROM the user (burns/sends)  
      const transfersOut = await queryLogsInChunks(publicClient, {
        address: pairAddress,
        event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'),
        args: { from: address },
      });
      
      const allTransfers = [...transfersIn, ...transfersOut];
      
      if (allTransfers.length === 0) {
        return { 
          events: [], 
          firstTimestamp: null, 
          lastTimestamp: null, 
          mintCount: 0, 
          burnCount: 0,
          noHistoryFound: true,
        };
      }
      
      // Get unique block numbers and fetch timestamps
      const blockNumbers = [...new Set(allTransfers.map(t => t.blockNumber))];
      const blocks = await Promise.all(
        blockNumbers.map(bn => publicClient.getBlock({ blockNumber: bn }))
      );
      const blockData = {};
      blocks.forEach(b => {
        blockData[b.number.toString()] = { timestamp: Number(b.timestamp) * 1000 };
      });
      
      // Process transfers
      const events = await Promise.all(
        allTransfers.map(async (transfer) => {
          const isReceive = transfer.args.to?.toLowerCase() === address.toLowerCase();
          
          // Get Sync event from same block
          let syncLog = null;
          try {
            const syncLogs = await publicClient.getLogs({
              address: pairAddress,
              event: parseAbiItem('event Sync(uint112 reserve0, uint112 reserve1)'),
              fromBlock: transfer.blockNumber,
              toBlock: transfer.blockNumber,
            });
            syncLog = syncLogs.find(s => s.transactionHash === transfer.transactionHash) || syncLogs[syncLogs.length - 1];
          } catch (e) {
            console.warn('Failed to get Sync event');
          }
          
          const reserve0 = syncLog ? Number(formatUnits(syncLog.args.reserve0, token0Decimals)) : 0;
          const reserve1 = syncLog ? Number(formatUnits(syncLog.args.reserve1, token1Decimals)) : 0;
          const lpAmount = Number(formatUnits(transfer.args.value, 18));
          
          // Estimate share (rough - would need totalSupply for exact)
          const estimatedShare = lpAmount / 1000;
          
          return {
            type: isReceive ? 'Mint' : 'Burn',
            transactionHash: transfer.transactionHash,
            blockNumber: Number(transfer.blockNumber),
            timestamp: blockData[transfer.blockNumber.toString()]?.timestamp,
            lpAmount,
            amount0: reserve0 * estimatedShare,
            amount1: reserve1 * estimatedShare,
            reserve0,
            reserve1,
            k: reserve0 * reserve1,
            actionType: isReceive ? 'Mint' : 'Burn',
          };
        })
      );
      
      events.sort((a, b) => a.blockNumber - b.blockNumber);
      
      const mintCount = events.filter(e => e.type === 'Mint').length;
      const burnCount = events.filter(e => e.type === 'Burn').length;
      const timestamps = events.map(e => e.timestamp).filter(Boolean);
      
      return {
        events,
        firstTimestamp: timestamps.length ? Math.min(...timestamps) : null,
        lastTimestamp: timestamps.length ? Math.max(...timestamps) : null,
        mintCount,
        burnCount,
      };
    },
    enabled: !!address && !!pairAddress && !!publicClient,
    staleTime: 60 * 1000,
  });
}
