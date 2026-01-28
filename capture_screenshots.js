const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const urls = [
    { name: '01_Landing_Page', url: 'http://localhost:3001/' },
    { name: '02_Create_Token', url: 'http://localhost:3001/create-token' },
    { name: '03_Create_Pool', url: 'http://localhost:3001/create-liquidity-pool' },
    { name: '04_Affiliate_Program', url: 'http://localhost:3001/affiliate' },
    { name: '05_Trending_Tokens', url: 'http://localhost:3001/copy-trending-tokens' },
    { name: '06_Admin_Overview', url: 'http://localhost:3001/admin' },
    { name: '07_Profile_Settings', url: 'http://localhost:3001/profile' }
];

// Note: Using port 3001 as 3000 might be locked or we force 3001 to be safe
// If server runs on 3000, change above.

const outputDir = path.join(__dirname, 'platform-design-assets');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    for (const item of urls) {
        console.log(`Navigating to ${item.name} at ${item.url}...`);
        try {
            await page.setViewport({ width: 1440, height: 900 });
            await page.goto(item.url, { waitUntil: 'networkidle0', timeout: 60000 });

            // Scroll to bottom
            await page.evaluate(async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 100;
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 50);
                });
            });
            await new Promise(r => setTimeout(r, 1000));

            await page.screenshot({ path: path.join(outputDir, `${item.name}_Desktop.png`), fullPage: true });
            console.log(`Saved ${item.name}_Desktop.png`);

            // Mobile
            await page.setViewport({ width: 375, height: 812, isMobile: true });
            await new Promise(r => setTimeout(r, 500));
            // Mobile screenshot - maybe not full page to emulate phone? using fullPage for now
            await page.screenshot({ path: path.join(outputDir, `${item.name}_Mobile.png`), fullPage: true });
            console.log(`Saved ${item.name}_Mobile.png`);

        } catch (error) {
            console.error(`Failed to capture ${item.name}:`, error);
        }
    }

    await browser.close();
    console.log('Done.');
})();
