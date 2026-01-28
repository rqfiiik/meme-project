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

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Login
    console.log('Logging in...');
    await page.goto(BASE_URL + '/api/auth/signin', { waitUntil: 'networkidle0' });
    if (page.url().includes('signin')) {
        await page.type('input[type="email"]', CREDS.email);
        await page.type('input[type="password"]', CREDS.password);

        await page.click('button[type="submit"]');

        // Wait for redirection to home or profile
        try {
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 });
        } catch (e) {
            console.log('Navigation wait timeout, checking if we are logged in...');
        }
    }

    // Safety check - force go to home if not there
    if (page.url().includes('signin') || page.url().includes('auth')) {
        console.log('Still on signin, waiting more...');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    console.log('Logged in (presumably). URL:', page.url());

    console.log('Opening Profile Dropdown...');
    // Wait for the profile image/button. Identifying by class or structure logic.
    // The profile button is in the header. It has an img or a div with initials.
    // Let's try to find it by a robust selector. The dropdown component is likely in the header.
    // We can look for the button that contains the user image or initials.

    // Waiting for header to load
    await new Promise(r => setTimeout(r, 2000));

    // Try finding the button by the profile image alt text "Profile" or just the button in the header right area.
    try {
        // Find the button that toggles the dropdown.
        // It has specific classes: rounded-full bg-surface border...
        // Let's rely on it being the last button in the header or check for the image.
        const profileBtn = await page.waitForSelector('button:has(img[alt="Profile"]), button:has(div:first-child)', { timeout: 5000 });
        if (profileBtn) {
            await profileBtn.click();
            console.log('Clicked profile button.');
        } else {
            console.error('Profile button not found via simple selector.');
        }
    } catch (e) {
        console.log('Trying fallback selector...');
        // Fallback: look for the button inside the ProfileDropdown container
        // We might just click the avatar image
        await page.click('img[alt="Profile"]');
    }

    await new Promise(r => setTimeout(r, 1000)); // Wait for dropdown animation

    console.log('Clicking Dashboard link...');
    // Click "Dashboard" in the dropdown
    const dashboardBtn = await page.waitForSelector('::-p-text("Dashboard")');
    if (dashboardBtn) {
        await dashboardBtn.click();
        console.log('Clicked Dashboard.');
    } else {
        console.error('Dashboard button not found.');
    }

    // Wait for Modal
    await new Promise(r => setTimeout(r, 3000)); // Wait for data fetch and animation

    console.log('Capturing Dashboard Modal...');
    // Capture
    await page.screenshot({ path: path.join(outputDir, '11_Creator_Dashboard_Desktop.png'), fullPage: false }); // Modal might not be full page, but let's see.
    // Actually, fullPage might capture the background too. Let's just do viewport or fullPage.
    await page.screenshot({ path: path.join(outputDir, '11_Creator_Dashboard_Desktop_Full.png'), fullPage: true });

    await browser.close();
    console.log('Done.');
})();
