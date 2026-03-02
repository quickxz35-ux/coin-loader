#!/usr/bin/env node
const { chromium } = require('playwright');

// URLs to open
const URLS = [
  { name: 'CoinGlass Inflow/Outflow', url: 'https://www.coinglass.com/spot-inflow-outflow' },
  { name: 'TradingView Chart 1', url: 'https://www.tradingview.com/chart/p73NNDSL/' },
  { name: 'TradingView Chart 2', url: 'https://www.tradingview.com/chart/2MevUjbH/' },
  { name: 'CoinGlass Legend', url: 'https://legend.coinglass.com/chart/87ed05aaf2b9468eac5aec1b5c23bcb1' },
  { name: 'CoinAnk Long/Short', url: 'https://coinank.com/longshort/realtime' },
];

// Site-specific selectors for coin input
const SITE_CONFIGS = {
  'coinglass.com': {
    searchButton: '[data-testid="search-icon"], .search-icon, input[placeholder*="Search"], .ant-input-search',
    input: 'input[placeholder*="Search"], input[placeholder*="Coin"], .ant-input, [data-testid="search-input"]',
    submit: '.ant-btn, button[type="submit"], .search-btn',
  },
  'tradingview.com': {
    searchButton: '.tv-search-row__input, [data-name="symbol-search-button"], .chart-gui-wrapper button',
    input: 'input[placeholder*="Search"], .tv-search-row__input, input[data-role="search"]',
    submit: 'button[type="submit"], .tv-search-row__symbol-button',
  },
  'coinank.com': {
    searchButton: 'input[placeholder*="coin"], input[placeholder*="search"], .search-input',
    input: 'input[placeholder*="coin"], input[placeholder*="search"], .el-input__inner',
    submit: 'button, .search-btn, .el-button',
  },
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setCoinOnPage(page, coin, siteName) {
  console.log(`Setting ${coin} on ${siteName}...`);
  
  const url = page.url();
  const domain = Object.keys(SITE_CONFIGS).find(d => url.includes(d));
  const config = domain ? SITE_CONFIGS[domain] : null;
  
  if (!config) {
    console.log(`  ⚠️ No automation config for ${siteName}, manual selection needed`);
    return;
  }
  
  try {
    // Wait for page to fully load
    await sleep(3000);
    
    // Try to find and click search button first (if exists)
    try {
      const searchBtn = await page.locator(config.searchButton).first();
      if (await searchBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await searchBtn.click();
        await sleep(500);
      }
    } catch {}
    
    // Find input and type coin
    const input = await page.locator(config.input).first();
    await input.waitFor({ timeout: 5000 });
    
    // Clear existing value and type new coin
    await input.fill('');
    await sleep(200);
    await input.fill(coin.toUpperCase());
    await sleep(500);
    
    // Press Enter to submit
    await input.press('Enter');
    await sleep(1500);
    
    console.log(`  ✅ ${coin} set on ${siteName}`);
  } catch (e) {
    console.log(`  ⚠️ Could not automate ${siteName}: ${e.message}`);
  }
}

async function loadCoin(coin) {
  if (!coin || coin.trim() === '') {
    console.log('Usage: node load-coin.js <COIN_SYMBOL>');
    console.log('Example: node load-coin.js BTC');
    process.exit(1);
  }
  
  coin = coin.trim().toUpperCase();
  console.log(`\n🚀 Loading ${coin} across all trading tools...\n`);
  
  // Path to your existing Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  
  // Launch Chrome with your profile (so you're already logged in)
  const browser = await chromium.launch({ 
    headless: false,
    executablePath: chromePath,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const pages = [];
  
  try {
    // Open first URL in first tab
    const page1 = await context.newPage();
    await page1.goto(URLS[0].url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    pages.push({ page: page1, ...URLS[0] });
    
    // Open remaining URLs in new tabs
    for (let i = 1; i < URLS.length; i++) {
      const page = await context.newPage();
      await page.goto(URLS[i].url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      pages.push({ page, ...URLS[i] });
    }
    
    console.log(`Opened ${pages.length} tabs\n`);
    
    // Set coin on each page
    for (const { page, name } of pages) {
      await setCoinOnPage(page, coin, name);
    }
    
    console.log(`\n✅ All pages loaded for ${coin}!`);
    console.log('Browser will stay open. Close it manually when done.\n');
    
  } catch (e) {
    console.error('Error:', e.message);
    await browser.close();
    process.exit(1);
  }
}

// Get coin from command line
const coin = process.argv[2];
loadCoin(coin);
