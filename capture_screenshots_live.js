const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://meme-project-teal.vercel.app';
const CREDS = {
    email: 'rqfik.lakehal@gmail.com',
    password: 'RA07092004fik*'
};

const urls = [
    { name: '01_Landing_Page', url: BASE_URL + '/' },
    { name: '02_Create_Token', url: BASE_URL + '/create-token' },
    { name: '03_Create_Pool', url: BASE_URL + '/create-liquidity-pool' },
    { name: '04_Affiliate_Program', url: BASE_URL + '/affiliate' },
    { name: '05_Trending_Tokens', url: BASE_URL + '/copy-trending-tokens' },
    // Protected pages need login
    { name: '06_Admin_Overview', url: BASE_URL + '/admin' },
    { name: '07_Profile_Settings', url: BASE_URL + '/profile' },
    { name: '08_Admin_Users', url: BASE_URL + '/admin/users' },
    { name: '09_Admin_Creators', url: BASE_URL + '/admin/creators' },
    { name: '10_Admin_Wallets', url: BASE_URL + '/admin/wallets' }
];

const outputDir = path.join(__dirname, 'platform-design-assets');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Perform Login First
    console.log('Navigating to login...');
    try {
        await page.goto(BASE_URL + '/api/auth/signin', { waitUntil: 'networkidle0' });

        // Wait for inputs (adjust selectors if needed, assuming standard NextAuth/HTML structure)
        // Trying generic selectors or looking for name/id
        // Usually NextAuth default page has inputs with specifics, but custom pages might differ.
        // Let's assume standard input types if IDs fail.

        const emailSelector = 'input[type="email"]';
        const passwordSelector = 'input[type="password"]';
        const submitSelector = 'button[type="submit"]';

        // Check if we are already logged in (redirected to home)
        if (page.url() !== BASE_URL + '/api/auth/signin') {
            console.log('Already logged in or redirected.');
        } else {
            console.log('Entering credentials...');
            await page.waitForSelector(emailSelector, { timeout: 5000 });
            await page.type(emailSelector, CREDS.email);
            await page.type(passwordSelector, CREDS.password);

            console.log('Submitting...');
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                page.click(submitSelector),
            ]);
            console.log('Login complete.');
        }
    } catch (e) {
        console.error('Login failed or not needed:', e.message);
        // Continue anyway, maybe some pages are public
    }

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
            await new Promise(r => setTimeout(r, 2000)); // Wait for animations/lazy load

            await page.screenshot({ path: path.join(outputDir, `${item.name}_Desktop.png`), fullPage: true });
            console.log(`Saved ${item.name}_Desktop.png`);

            // Mobile
            await page.setViewport({ width: 375, height: 812, isMobile: true });
            await new Promise(r => setTimeout(r, 500));
            // Reload for mobile layout if necessary? Usually resize acts dynamic.
            await page.screenshot({ path: path.join(outputDir, `${item.name}_Mobile.png`), fullPage: true });
            console.log(`Saved ${item.name}_Mobile.png`);

        } catch (error) {
            console.error(`Failed to capture ${item.name}:`, error);
        }
    }

    await browser.close();
    console.log('Done.');
})();
