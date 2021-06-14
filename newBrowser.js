const puppeteer = require('puppeteer');

module.exports.run = async function () {
	let options = {
		headless: true,
	};
	if (process.env.ENVIRONMENT === 'local')
		options.executablePath = './node_modules/puppeteer/.local-chromium/mac-884014/chrome-mac/Chromium.app/Contents/MacOS/Chromium';
	if (process.env.ENVIRONMENT === 'pi')
		options.args = ['--no-sandbox', '--disable-setuid-sandbox'];

	let browser = await puppeteer.launch(options);

	let context = browser.defaultBrowserContext();
	context.overridePermissions('https://www.facebook.com', ['geolocation', 'notifications']);

	return browser;
};