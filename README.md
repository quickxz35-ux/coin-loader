# Coin Loader

Quickly load a coin across all your trading tools.

## Usage

```bash
# Load a coin (example: BTC)
npm run load BTC

# Or directly
node load-coin.js BTC
node load-coin.js ETH
node load-coin.js SOL
```

## What It Does

Opens 5 browser tabs and tries to automatically select your coin:
1. CoinGlass Spot Inflow/Outflow
2. TradingView Chart 1
3. TradingView Chart 2  
4. CoinGlass Legend Chart
5. CoinAnk Long/Short Realtime

## Note

This uses browser automation (Playwright) to interact with the websites. 
Some sites may change their layout and break the automation - let me know if that happens!

## Requirements

- Node.js
- Playwright (already installed)
- Chromium browser (auto-downloaded by Playwright)
