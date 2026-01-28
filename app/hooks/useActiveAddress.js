'use client';

import { useAccount } from 'wagmi';
import { useManualAddress } from '../providers/Web3Provider';

/**
 * Hook that returns the active address to use for queries.
 * Prioritizes connected wallet, falls back to manually entered address.
 * 
 * @returns {Object} { address, isConnected, isManual, source }
 */
export function useActiveAddress() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { manualAddress } = useManualAddress();
  
  // Connected wallet takes priority
  if (isConnected && connectedAddress) {
    return {
      address: connectedAddress,
      isConnected: true,
      isManual: false,
      source: 'wallet',
    };
  }
  
  // Fall back to manual address
  if (manualAddress) {
    return {
      address: manualAddress,
      isConnected: false,
      isManual: true,
      source: 'manual',
    };
  }
  
  // No address available
  return {
    address: null,
    isConnected: false,
    isManual: false,
    source: null,
  };
}
