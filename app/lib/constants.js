/**
 * Application constants
 */

// Chain configurations
export const CHAINS = {
  base: {
    id: 8453,
    name: 'Base',
    network: 'base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

// Uniswap V2 contract addresses per chain
export const UNISWAP_V2_ADDRESSES = {
  base: {
    factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
    router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
  },
};

// Common token addresses on Base
export const TOKEN_ADDRESSES = {
  base: {
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDbC: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
  },
};

// DeFiLlama API
export const DEFILLAMA_API = {
  baseUrl: 'https://coins.llama.fi',
  prices: {
    current: '/prices/current',
    historical: '/prices/historical',
  },
};

// Default settings
export const DEFAULTS = {
  chainId: CHAINS.base.id,
  slippage: 0.5, // 0.5%
  deadline: 20, // 20 minutes
};

// Calculation mode options
export const CALCULATION_MODES = {
  FULL_HISTORY: 'fullHistory',
  SINCE_LAST_ACTION: 'sinceLastAction',
};

// Event signatures for Uniswap V2
export const EVENT_SIGNATURES = {
  // Pair events
  Mint: 'Mint(address,uint256,uint256)',
  Burn: 'Burn(address,uint256,uint256,address)',
  Swap: 'Swap(address,uint256,uint256,uint256,uint256,address)',
  Sync: 'Sync(uint112,uint112)',
  Transfer: 'Transfer(address,address,uint256)',
  
  // Factory events
  PairCreated: 'PairCreated(address,address,address,uint256)',
};

// Time constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
};

// Formatting options
export const FORMAT = {
  USD: {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  PERCENT: {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  COMPACT: {
    notation: 'compact',
    maximumFractionDigits: 2,
  },
};
