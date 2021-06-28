const puppeteer = require('puppeteer-core');

module.exports.run = async function () {
	let options = {
		headless: false,
	};
	if (process.env.ENVIRONMENT === 'local')
		options.executablePath = './node_modules/puppeteer/.local-chromium/mac-884014/chrome-mac/Chromium.app/Contents/MacOS/Chromium';
	if (process.env.ENVIRONMENT === 'pi') {
		options.args = ['--no-sandbox', '--disable-setuid-sandbox'];
		options.executablePath = '/usr/bin/chromium-browser';
	}

	let browser = await puppeteer.launch(options);

	console.log(await browser.userAgent());

	let context = browser.defaultBrowserContext();
	context.overridePermissions('https://www.facebook.com', ['geolocation', 'notifications']);

	return browser;
};