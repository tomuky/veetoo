# Uniswap V2 LP Position Tracker

A web app for tracking Uniswap V2 liquidity provider positions on Base. View your LP positions, calculate impermanent loss, track fees earned, and analyze performance vs holding.

## Features

- **Wallet Connection** - Connect your wallet or enter any address to view positions
- **Position Discovery** - Automatically discovers all Uniswap V2 LP positions on Base
- **Impermanent Loss Calculation** - See the pure IL impact on your positions
- **Fee Tracking** - Estimate fees earned from trading activity
- **P&L Analysis** - Compare LP performance vs simply holding the tokens (HODL)
- **APY Calculation** - Annualized returns based on time in pool

## Tech Stack

- [Next.js](https://nextjs.org) 16 with App Router
- [React](https://react.dev) 19
- [wagmi](https://wagmi.sh) + [viem](https://viem.sh) for Web3 interactions
- [TanStack Query](https://tanstack.com/query) for data fetching
- [Recharts](https://recharts.org) for charts

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. The app scans for ERC-20 Transfer events where the user received tokens
2. Filters to valid Uniswap V2 pairs by checking for the `token0()` function
3. Fetches position details including reserves, token metadata, and user share
4. Calculates IL using the standard formula: `2 * sqrt(priceRatio) / (1 + priceRatio) - 1`
5. Estimates fees by comparing actual position value to theoretical value with IL only
