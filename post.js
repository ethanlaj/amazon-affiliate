const facebookLogin = require('./facebookLogin').run,
	wait = require('./wait').run,
	checkTimes = require('./checkTimes').run,
	checkFlagged = require('./checkFlagged').run;

let ms = require('ms');

const EMOJIS = ['😍', '🔥', '💕', '🥰', '😮', '‼️', '🙈', '😎', '😳', '🤑'];

const MESSAGES = [
	'This is such a good deal!',
	'This is such a great deal!',
	'This is such an amazing deal!',
	'This is a must have item!',
	'I\'m sending this to my friend!',
	'Wow! I\'ve never seen such a good deal before!',
	'I\'m going to order this asap',
	'This is running out quick!',
	'Love this deal!',
	'This is one of my favorite deals!',
	'I can save so much money with this deal!',
];

let endMessage = '#ad - Codes and discounts are valid at the time of posting and can expire at ANY time.';

async function close (page) {
	page.closed = true;
	return await page.close().catch(() => {});
}

function listen (page) {
	page.on('error', async (err) => {
		if (err.toString().startsWith('Error: Page crashed')) {
			page.removeAllListeners('error');

			console.log('Page crashed. Refreshing now...');

			await close(page);

			return;
		}
	});
}

module.exports.run = async function (browser, promos) {
	let fbPage = await facebookLogin(browser);

	let createPostButton = await fbPage.waitForSelector('aria/Create a public post…');
	await createPostButton.click();

	let typeHere;
	let tries = 0;
	do {
		tries++;

		await wait(ms('2s'));
		typeHere = await fbPage.$$('aria/Create a public post…');
	} while ((!typeHere || typeHere.length === 1) && tries <= 30);

	if (typeHere.length === 1)
		throw new Error('Could not find typing space.');

	await typeHere[1].type(
		`😍 55% off!! 😍
🤑 I'm sending this to my friend! 🤑

Use code: 55UVZT1B
Link: https://www.amazon.com/dp/B07YJBVZYR?m=A31J6EAZTKAANS...

#ad - Codes and discounts are valid at the time of posting and can expire at ANY time.`);

	await wait(ms('5s'));
	let submitButton = await fbPage.waitForSelector('aria/Post');
	await submitButton.click();

	await wait(ms('5s'));
	await checkFlagged(browser, fbPage);


	/*let promo;
	let i;

	for (i = 0; i < promos.length; i++) {
		try {
			if (fbPage.closed)
				fbPage = await facebookLogin(browser);

			listen(fbPage);

			promo = promos[i];

			if (promo.productLinks[0] && checkTimes(promo) && promo.tries <= 5) {
				console.log('Posting...');
				promo.tries++;

				let createPostButton = await fbPage.waitForSelector('aria/Create a public post…');
				await createPostButton.click();

				let emoji1 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
				let emoji2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
				while (emoji2 === emoji1) {
					emoji2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
				}
				let innerMessage = MESSAGES[Math.floor(Math.random() * EMOJIS.length)];

				let msg = `${emoji1} ${promo.percent}% off!! ${emoji1}\n` +
						`${emoji2} ${innerMessage} ${emoji2}\n\n` +
						`Use code: ${promo.promoCode}\n` +
						`Link: ${promo.productLinks[0]}\n\n` +
						endMessage;

				await wait(ms('1m'));
				await fbPage.keyboard.type(msg);

				await wait(ms('1m'));

				let submitButton = await fbPage.waitForSelector('aria/Post');
				await submitButton.click();

				promo.posted = true;

				await wait(ms('15s'));
				let flagged = await checkFlagged(browser, fbPage);
				if (flagged) {
					i--;

					promo.tries--;

					await wait(ms('29m'));
					fbPage = await facebookLogin(browser);
				}

				await close(fbPage);

				fbPage.removeAllListeners('error');

				console.log('Successfully posted...');

				await wait(ms('1m'));
			}
		} catch {
			if (!promo.posted)
				i--;

			await close(fbPage);
		}
	}*/
	await wait(ms('1m'));

	await close(fbPage);

	return;
};
