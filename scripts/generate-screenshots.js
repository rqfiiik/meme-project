const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '../platform-design-assets');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PAGES = [
    { name: '01_Landing_Page', path: '/' },
    { name: '02_Create_Token_Step1', path: '/create-token' },
    // Step 2 requires interaction, might skip or try to mock
    { name: '03_Create_Pool', path: '/create-liquidity-pool' },
    { name: '04_Affiliate_Program', path: '/affiliate' },
    { name: '05_Trending_Tokens', path: '/copy-trending-tokens' },
    // Admin Pages (will require login)
    { name: '06_Admin_Overview', path: '/admin', auth: true },
    { name: '07_Admin_Users', path: '/admin/users', auth: true },
    { name: '08_Admin_Creators', path: '/admin/creators', auth: true },
    { name: '09_Admin_Wallets', path: '/admin/wallets', auth: true },
    { name: '10_Admin_Revenue', path: '/admin/revenue', auth: true },
];

const VIEWPORTS = [
    { name: 'Desktop', width: 1440, height: 900 },
    { name: 'Mobile', width: 375, height: 812 }, // iPhone X view
];

(async () => {
    console.log('Starting screenshot generation...');
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 1. Login Logic
    console.log('Logging in as Admin...');
    await page.goto(`${BASE_URL}/api/auth/signin`);
    // Simple wait for input
    const emailSelector = 'input[name="email"]'; // Adjust based on next-auth default or custom UI
    // If standard next-auth signin page:
    // Actually, we use custom modal or generic? 
    // Let's assume standard flow or try to set cookie directly if possible. 
    // Trying standard credentials login flow.
    try {
        await page.waitForSelector('input[name="email"]', { timeout: 5000 });
        await page.type('input[name="email"]', 'rqfik.lakehal@gmail.com');
        await page.type('input[name="password"]', 'RA07092004fik*');
        // Click Sign In with Credentials if plain button exists, or form submit
        // NextAuth default signin page usually has a button "Sign in with Credentials"
        // Let's try pressing Enter
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
        console.log('Login successful (assumed).');
    } catch (e) {
        console.warn('Login flow check failed or custom UI detected. Trying to proceed anyway (public pages will work).', e.message);
    }

    // 2. Capture Pages
    for (const view of VIEWPORTS) {
        console.log(`\nProcessing ${view.name} Viewport...`);
        await page.setViewport({ width: view.width, height: view.height });

        for (const p of PAGES) {
            if (p.auth && view.name === 'Mobile') continue; // Optional: Skip admin on mobile if irrelevant, but let's keep it.

            console.log(`  Capturing ${p.name}...`);
            try {
                await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle0' });

                // MOCK DATA INJECTION (Optional)
                // If dashboard is empty, we might want to inject some DOM elements? 
                // For now, capturing actual state.

                const filename = `${p.name}_${view.name}.png`;
                await page.screenshot({
                    path: path.join(OUTPUT_DIR, filename),
                    fullPage: true
                });
                console.log(`    Saved to ${filename}`);
            } catch (err) {
                console.error(`    Failed to capture ${p.name}:`, err.message);
            }
        }
    }

    await browser.close();
    console.log(`\nAll screenshots saved to: ${OUTPUT_DIR}`);
})();
