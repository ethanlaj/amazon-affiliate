const CONTACT_LINK = /https:\/\/www.facebook.com\/help\/contact\/[0-9]+\?additional_content=/;
const wait = require('./wait').run;

async function close (page) {
	page.closed = true;
	return await page.close().catch(() => {});
}

module.exports.run = async function (browser, fbPage) {
	let innerText = await fbPage.evaluate(() => {
		/* eslint-disable-next-line no-undef */
		return document.querySelector('body').innerText;
	});

	let flagged = innerText.includes('We limit how often you can post, comment or do other things in a given amount of time in order to help protect the community from spam. You can try again later.');
	if (flagged) {
		console.log('Facebook flagged bot for spam. Trying again in 30 minutes.');

		let links = await fbPage.$$eval('a', (as) => as.map((a) => a.href))
			.then((r) => r.filter((l) => CONTACT_LINK.test(l) )).catch(() => {});
		let link = links[0];

		await close(fbPage);

		let submitFeedback = await browser.newPage();
		await submitFeedback.goto(link);

		try {
			const explainError = await submitFeedback.waitForSelector('aria/Please explain why you think this was an error');
			await explainError.type('All I was doing was posting amazon deals for my Facebook page.');
			const submit = await submitFeedback.waitForSelector('aria/Send');
			await submit.click();
		} catch (e) {
			console.log('\n\n\nError submitting feedback to facebook');
			console.log(e);
			console.log('\n\n\n');
		}

		await wait(ms('15s'));

		await submitFeedback.close();

		return true;
	}

	return false;
};
