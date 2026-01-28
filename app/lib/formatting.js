/**
 * Formatting utilities
 */

/**
 * Format a number as USD currency
 * @param {number} value 
 * @param {Object} options
 * @returns {string}
 */
export function formatUSD(value, options = {}) {
  const { compact = false, showSign = false } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return '$--';
  }
  
  const absValue = Math.abs(value);
  const sign = value >= 0 ? (showSign ? '+' : '') : '-';
  
  if (compact && absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(2)}M`;
  }
  if (compact && absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(2)}K`;
  }
  
  return `${sign}$${absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a number as percentage
 * @param {number} value - Decimal value (e.g., 0.05 for 5%)
 * @param {Object} options
 * @returns {string}
 */
export function formatPercent(value, options = {}) {
  const { showSign = true, decimals = 2 } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }
  
  const percentValue = value * 100;
  const sign = percentValue >= 0 ? (showSign ? '+' : '') : '';
  
  return `${sign}${percentValue.toFixed(decimals)}%`;
}

/**
 * Format a token amount with appropriate precision
 * @param {number} value 
 * @param {Object} options
 * @returns {string}
 */
export function formatTokenAmount(value, options = {}) {
  const { decimals = 6, symbol = '' } = options;
  
  if (value === null || value === undefined || isNaN(value)) {
    return '--';
  }
  
  let formatted;
  const absValue = Math.abs(value);
  
  if (absValue === 0) {
    formatted = '0';
  } else if (absValue < 0.000001) {
    formatted = '<0.000001';
  } else if (absValue < 1) {
    formatted = value.toFixed(decimals);
  } else if (absValue < 1000) {
    formatted = value.toFixed(4);
  } else if (absValue < 1000000) {
    formatted = value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  } else {
    formatted = `${(value / 1000000).toFixed(2)}M`;
  }
  
  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Format an address with ellipsis
 * @param {string} address 
 * @param {number} startChars 
 * @param {number} endChars 
 * @returns {string}
 */
export function formatAddress(address, startChars = 6, endChars = 4) {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a timestamp as relative time
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

/**
 * Format a timestamp as date string
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @param {Object} options
 * @returns {string}
 */
export function formatDate(timestamp, options = {}) {
  const { includeTime = false } = options;
  
  if (!timestamp) return '--';
  
  const date = new Date(timestamp);
  
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  if (includeTime) {
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr} ${timeStr}`;
  }
  
  return dateStr;
}

/**
 * Format duration in human-readable form
 * @param {number} milliseconds 
 * @returns {string}
 */
export function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

/**
 * Get CSS class for value (positive/negative/neutral)
 * @param {number} value 
 * @returns {string}
 */
export function getValueClass(value) {
  if (value > 0) return 'value-positive';
  if (value < 0) return 'value-negative';
  return 'value-neutral';
}
