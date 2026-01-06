const dotenv = require('dotenv');
// Load environment variables from .env file (if it exists)
dotenv.config();

module.exports = async (browser, context) => {
    const page = await browser.newPage();
    try {
        // Increase timeout to 60s for CI environments
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 60000 });

        // Selectors - ADJUST THESE TO MATCH YOUR ACTUAL DOM
        const emailSelector = 'input[name="email"], input[type="email"]';
        const passwordSelector = 'input[name="password"], input[type="password"]';
        const submitSelector = 'button[type="submit"]';

        const email = process.env.LHCI_USER_EMAIL;
        const password = process.env.LHCI_USER_PASSWORD;

        if (!email || !password) {
            throw new Error('❌ Authentication Failed: Missing LHCI_USER_EMAIL or LHCI_USER_PASSWORD environment variables.');
        }

        await page.waitForSelector(emailSelector);
        await page.type(emailSelector, email);
        await page.type(passwordSelector, password);

        await Promise.all([
            page.click(submitSelector),
            page.waitForNavigation({ waitUntil: 'networkidle0' }), // Wait for redirect
        ]);

        // Setup cookies/localStorage for the actual Lighthouse run
        // Because LHCI reuses the browser connection, session cookies *should* persist.
    } catch (e) {
        console.error('Auth script failed:', e);
        throw e; // Rensuure CI fails if auth fails
    } finally {
        await page.close();
    }
};
