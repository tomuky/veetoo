'use client';

import { createContext, useContext, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect project ID - in production, use your own from cloud.walletconnect.com
const WALLETCONNECT_PROJECT_ID = '279db65d1bd6e36f55f72ecee8b90e7d';

// Create wagmi config with reliable RPC endpoints
const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({ 
      projectId: WALLETCONNECT_PROJECT_ID,
      showQrModal: true,
    }),
  ],
  transports: {
    [base.id]: http('https://base.meowrpc.com'),
  },
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    },
  },
});

// Context for manual address input (when not using wallet connection)
const AddressContext = createContext({
  manualAddress: null,
  setManualAddress: () => {},
});

export function useManualAddress() {
  return useContext(AddressContext);
}

export default function Web3Provider({ children }) {
  const [manualAddress, setManualAddress] = useState(null);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AddressContext.Provider value={{ manualAddress, setManualAddress }}>
          {children}
        </AddressContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
