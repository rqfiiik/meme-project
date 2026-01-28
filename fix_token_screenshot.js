const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://meme-project-teal.vercel.app';
const CREDS = {
    email: 'rqfik.lakehal@gmail.com',
    password: 'RA07092004fik*'
};

const outputDir = path.join(__dirname, 'platform-design-assets');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const dummyImagePath = path.join(__dirname, 'dummy_token.png');
const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync(dummyImagePath, buffer);

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Login first to ensure no auth errors
    console.log('Logging in...');
    await page.goto(BASE_URL + '/api/auth/signin', { waitUntil: 'networkidle0' });
    if (page.url().includes('signin')) {
        await page.type('input[type="email"]', CREDS.email);
        await page.type('input[type="password"]', CREDS.password);
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0' }),
            page.click('button[type="submit"]')
        ]);
    }

    console.log('Navigating to Create Token...');
    await page.goto(BASE_URL + '/create-token', { waitUntil: 'networkidle0' });

    // Capture initial state (Empty)
    await page.screenshot({ path: path.join(outputDir, '02a_Create_Token_Step1_Empty_Desktop.png'), fullPage: true });

    // Open Modal
    try {
        const modalBtn = await page.waitForSelector('::-p-text("Copy from Trending Coin")', { timeout: 5000 });
        if (modalBtn) {
            await modalBtn.click();
            await new Promise(r => setTimeout(r, 1000));
            await page.screenshot({ path: path.join(outputDir, '02b_Create_Token_TrendModal_Desktop.png'), fullPage: true });
            await page.keyboard.press('Escape');
            await new Promise(r => setTimeout(r, 500));
        }
    } catch (e) { console.log('Modal trigger failed:', e.message); }

    // Fill Form
    console.log('Filling form...');
    await page.type('input[placeholder="e.g. Bonk 2.0"]', 'Fixed Token');
    await page.type('input[placeholder="e.g. BONK"]', 'FIXED');

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) await fileInput.uploadFile(dummyImagePath);
    await new Promise(r => setTimeout(r, 2000)); // Wait for image preview

    // Capture Filled State
    await page.screenshot({ path: path.join(outputDir, '02c_Create_Token_Step1_Filled_Desktop.png'), fullPage: true });

    // Continue
    const nextBtn = await page.waitForSelector('::-p-text("Continue to Metadata")');
    await nextBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    // Capture Step 2
    await page.screenshot({ path: path.join(outputDir, '02d_Create_Token_Step2_Empty_Desktop.png'), fullPage: true });

    await browser.close();
    console.log('Done.');
})();
