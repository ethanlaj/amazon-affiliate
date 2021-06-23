let ms = require('ms');

module.exports.run = async function (browser) {
	const page = await browser.newPage();
	page.setDefaultTimeout(ms('3m'));

	await page.goto('https://affiliate-program.amazon.com/home/promohub/promocodes');

	try {
		await page.type('#ap_email', process.env.EMAIL).catch(() => {});
		await page.type('#ap_password', process.env.AMAZON_PW);

		await Promise.all([
			page.waitForNavigation(),
			page.click('#signInSubmit')
		]);
	} catch {() => {};}

	return page;
};