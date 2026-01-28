/**
 * Token logo URL utilities - fetches from CDN sources
 */

// Chain ID to Trust Wallet chain name mapping
const CHAIN_NAMES = {
  1: 'ethereum',
  8453: 'base',
  10: 'optimism',
  42161: 'arbitrum',
  137: 'polygon',
};

// WETH addresses map to ETH logo (by chain)
const WETH_ADDRESSES = {
  '0x4200000000000000000000000000000000000006': true, // Base WETH
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': true, // Mainnet WETH
};

/**
 * Get token logo URL from CDN sources
 * Uses Trust Wallet assets which covers most tokens
 * @param {string} address - Token contract address (checksummed)
 * @param {number} chainId - Chain ID (default: 8453 for Base)
 * @returns {string} Logo URL
 */
export function getTokenLogoUrl(address, chainId = 8453) {
  if (!address) return null;
  
  const lowerAddress = address.toLowerCase();
  
  // WETH -> use ETH logo from mainnet
  if (WETH_ADDRESSES[lowerAddress]) {
    return 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png';
  }
  
  const chainName = CHAIN_NAMES[chainId] || 'base';
  
  // Trust Wallet assets CDN - widely used, good coverage
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/assets/${address}/logo.png`;
}

/**
 * Generate fallback avatar from symbol
 * @param {string} symbol - Token symbol
 * @returns {string} Data URL for SVG avatar
 */
export function getTokenFallbackAvatar(symbol) {
  const letter = symbol ? symbol.charAt(0).toUpperCase() : '?';
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
  ];
  
  // Generate consistent color from symbol
  const colorIndex = symbol 
    ? symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;
  const bgColor = colors[colorIndex];
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="${bgColor}"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-family="system-ui, sans-serif" font-size="18" font-weight="600">${letter}</text>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}
