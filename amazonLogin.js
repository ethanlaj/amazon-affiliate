let ms = require('ms');
const doNotLoad = require('./doNotLoad').run;
const passwords = require('./passwords').amazon;

module.exports.run = async function (browser) {
	const page = await browser.newPage();
	page.setDefaultTimeout(ms('3m'));
	await doNotLoad(page);

	await page.goto('https://affiliate-program.amazon.com/home/promohub/promocodes');

	try {
		await page.type('#ap_email', passwords.email).catch(() => {});
		await page.type('#ap_password', passwords.pw);

		await Promise.all([
			page.waitForNavigation(),
			page.click('#signInSubmit')
		]);
	} catch {() => {};}

	return page;
};