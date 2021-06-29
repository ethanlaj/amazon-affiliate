let ms = require('ms');
const doNotLoad = require('./doNotLoad').run;

module.exports.run = async function (browser) {
	const page = await browser.newPage();
	page.setDefaultTimeout(ms('1m'));

	await page.setViewport({
		width: 1500,
		height: 700,
	});

	await doNotLoad(page);

	await page.goto('https://www.facebook.com/groups/amazeballdeals');
	try {
		let email = await page.waitForSelector('aria/Email or Phone');
		await email.type(process.env.EMAIL);

		let password = await page.waitForSelector('aria/Password');
		await password.type(process.env.FB_PW);

		let loginButton = await page.waitForSelector('aria/Accessible login button');

		await Promise.all([
			page.waitForNavigation(),
			loginButton.click(),
		]);
	} catch {() => {};}

	return page;
};