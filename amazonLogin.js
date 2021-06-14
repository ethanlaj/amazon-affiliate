module.exports.run = async function (browser) {
	const page = await browser.newPage();
	await page.goto('https://affiliate-program.amazon.com/home/promohub/promocodes');

	try {
		await page.type('#ap_email', process.env.EMAIL);
		await page.type('#ap_password', process.env.AMAZON_PW);

		await Promise.all([
			page.waitForNavigation(),
			page.click('#signInSubmit')
		]);
	} catch {
		console.log('Most likely already logged into Amazon, skipping logging in again.');
	}

	return page;
};