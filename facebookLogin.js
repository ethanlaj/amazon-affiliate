const wait = require('./wait').run;
const ms = require('ms');

module.exports.run = async function (browser) {
	const page = await browser.newPage();
	await page.goto('https://www.facebook.com/login');

	try {
		await page.type('#email', process.env.EMAIL);
		await page.type('#pass', process.env.FB_PW);

		await Promise.all([
			page.waitForNavigation(),
			page.click('#loginbutton')
		]);
	} catch {
		console.log('Most likely already logged into Facebook, skipping logging in again.');
	}

	await wait(ms('1m'));

	await page.goto('https://www.facebook.com/groups/amazeballdeals');

	return page;
};