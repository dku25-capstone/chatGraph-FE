/**
 * Puppeteer script for Lighthouse CI authentication
 * usage: link this in lighthouserc.js under collect.puppeteerScript
 */

module.exports = async (browser, context) => {
    // Only run login logic for pages that require it (or run once globally if architected that way)
    // But LHCI runs this script for *every* URL. 
    // Custom logic to check if we are on a login page or if we need to login could go here.

    const page = await browser.newPage();
    try {
        // Increase timeout to 60s for CI environments
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 60000 });

        // Selectors - ADJUST THESE TO MATCH YOUR ACTUAL DOM
        const emailSelector = 'input[name="email"], input[type="email"]';
        const passwordSelector = 'input[name="password"], input[type="password"]';
        const submitSelector = 'button[type="submit"]';

        await page.waitForSelector(emailSelector);
        await page.type(emailSelector, 'lee@dku.ac.kr'); // Replace with valid test creds
        await page.type(passwordSelector, 'Test1111!');

        await Promise.all([
            page.click(submitSelector),
            page.waitForNavigation({ waitUntil: 'networkidle0' }), // Wait for redirect
        ]);

        // Setup cookies/localStorage for the actual Lighthouse run
        // Because LHCI reuses the browser connection, session cookies *should* persist.
    } catch (e) {
        console.error('Auth script failed:', e);
    } finally {
        await page.close();
    }
};
