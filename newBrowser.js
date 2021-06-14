const puppeteer = require('puppeteer');

module.exports.run = async function () {
	let browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
	let context = browser.defaultBrowserContext();
	context.overridePermissions('https://www.facebook.com', ['geolocation', 'notifications']);

	return browser;
};