const facebookLogin = require('./facebookLogin').run,
	wait = require('./wait').run,
	checkTimes = require('./checkTimes').run,
	checkFlagged = require('./checkFlagged').run,
	noSalesPost = require('./noSalesPost').run;

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

let endMsg = '\n\n#ad - Codes and discounts are valid at the time of posting and can expire at ANY time.';

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

module.exports.run = async function (browser, promos, loginInfo) {
	let fbPage = await facebookLogin(browser, loginInfo);

	let promo;
	let i;

	for (i = 0; i < promos.length; i++) {
		try {
			if (fbPage.closed)
				fbPage = await facebookLogin(browser, loginInfo);

			listen(fbPage);

			promo = promos[i];

			if (promo.productLinks[0] && checkTimes(promo) && promo.tries <= 5) {
				promo.tries++;

				let createPostButton = await fbPage.waitForSelector('aria/Create a public post…');
				await createPostButton.click();

				let emoji1 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
				let emoji2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
				while (emoji2 === emoji1) {
					emoji2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
				}
				let innerMessage = MESSAGES[Math.floor(Math.random() * EMOJIS.length)];

				let startMsg = `${emoji1} ${promo.percent}% off!! ${emoji1}\n` +
						`${emoji2} ${innerMessage} ${emoji2}\n\n` +
						`Use code: ${promo.promoCode}\n` +
						`Link: ${promo.productLinks[0]}`;

				await wait(ms('35s'));
				let typeHere = await fbPage.$$('aria/Create a public post…');

				typeHere = typeHere.find((e) => e._remoteObject.description.startsWith('div.notranslate'));
				if (!typeHere)
					throw new Error('Could not find post typing space.');
				await typeHere.type(startMsg);

				await wait(ms('43s'));

				await typeHere.type(endMsg);

				await wait(ms('2s'));

				let submitButton = await fbPage.waitForSelector('aria/Post');
				await submitButton.click();

				promo.posted = true;

				await wait(ms('8s'));
				let flagged = await checkFlagged(browser, fbPage);
				if (flagged) {
					i--;

					promo.tries--;

					await wait(ms('20m'));
				} else {
					await wait(ms('40s'));

					await noSalesPost(fbPage);
				}

				let likeButtons = await fbPage.$$('aria/Like');
				for (let likeButton of likeButtons)
					await likeButton.click().catch(() => {});

				await close(fbPage);

				fbPage.removeAllListeners('error');

				await wait(ms('15s'));
			}
		} catch {
			if (!promo.posted)
				i--;

			await close(fbPage);
		}
	}

	await wait(ms('10s'));

	await close(fbPage);

	return;
};