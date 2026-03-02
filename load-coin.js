const { chromium } = require('playwright');

const URLS = [
  { name: 'CoinGlass Inflow/Outflow', url: 'https://www.coinglass.com/spot-inflow-outflow' },
  { name: 'TradingView Chart 1', url: 'https://www.tradingview.com/chart/p73NNDSL/' },
  { name: 'TradingView Chart 2', url: 'https://www.tradingview.com/chart/2MevUjbH/' },
  { name: 'CoinGlass Legend', url: 'https://legend.coinglass.com/chart/87ed05aaf2b9468eac5aec1b5c23bcb1' },
  { name: 'CoinAnk Long/Short', url: 'https://coinank.com/longshort/realtime' },
];

const SITE_CONFIGS = {
  'coinglass.com': {
    input: 'input[placeholder*="Search"], input[placeholder*="Coin"], .ant-input',
  },
  'tradingview.com': {
    input: 'input[placeholder*="Search"], .tv-search-row__input',
  },
  'coinank.com': {
    input: 'input[placeholder*="coin"], input[placeholder*="search"], .el-input__inner',
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
    console.log(`  ⚠️ No config for ${siteName}`);
    return;
  }
  
  try {
    await sleep(3000);
    
    const input = await page.locator(config.input).first();
    await input.waitFor({ timeout: 5000 });
    
    await input.fill('');
    await sleep(200);
    await input.fill(coin.toUpperCase());
    await sleep(500);
    
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
  console.log(`\n🚀 Loading ${coin}...\n`);
  
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\Users\\gssjr\\AppData\\Local\\Google\\Chrome\\User Data';
  
  console.log('Launching Chrome with your profile...');
  
  // Use persistent context to keep your logins
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    executablePath: chromePath,
    args: ['--start-maximized'],
    viewport: { width: 1920, height: 1080 }
  });
  
  const pages = [];
  
  try {
    // Open all URLs
    for (const u of URLS) {
      const page = await browserContext.newPage();
      await page.goto(u.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      pages.push({ page, ...u });
      console.log(`Opened: ${u.name}`);
    }
    
    console.log(`\nOpened ${pages.length} tabs\n`);
    
    // Set coin on each page
    for (const { page, name } of pages) {
      await setCoinOnPage(page, coin, name);
    }
    
    console.log(`\n✅ Done! Close browser when finished.`);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

loadCoin(process.argv[2]);
