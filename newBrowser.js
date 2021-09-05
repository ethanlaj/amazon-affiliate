import puppeteer from 'puppeteer-core';

export let run = async function () {
	let options = {
		headless: false,
		defaultViewport: null,
	};

	if (process.env.ENVIRONMENT === 'local')
		options.executablePath = './node_modules/puppeteer/.local-chromium/mac-884014/chrome-mac/Chromium.app/Contents/MacOS/Chromium';
	if (process.env.ENVIRONMENT === 'pi') {
		options.args = ['--no-sandbox', '--disable-setuid-sandbox'];
		options.executablePath = '/usr/share/applications';
	}

	let browser = await puppeteer.launch(options);

	let context = browser.defaultBrowserContext();
	context.overridePermissions('https://www.facebook.com', ['geolocation', 'notifications']);

	return browser;
};