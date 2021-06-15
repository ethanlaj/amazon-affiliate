const facebookLogin = require('./facebookLogin').run,
	wait = require('./wait').run;

const ms = require('ms');

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

const CONTACT_LINK = /https:\/\/www.facebook.com\/help\/contact\/[0-9]+\?additional_content=/;

let endMessage = '#ad - Codes and discounts are valid at the time of posting and can expire at ANY time.';

module.exports.run = async function (browser, promos) {
	let fbPage = await facebookLogin(browser);

	for (let i = 0; i < promos.length; i++) {
		let promo = promos[i];

		if (promo.productLinks[0]) {
			let createPostButton = await fbPage.waitForSelector('aria/Create a public post…');
			await createPostButton.click();

			let emoji1 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
			let emoji2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
			while (emoji2 === emoji1) {
				emoji2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
			}
			let innerMessage = MESSAGES[Math.floor(Math.random() * EMOJIS.length)];

			//emoji1 += emoji1;
			//emoji2 += emoji2;

			let msg = `${emoji1} ${promo.percent} percent off!! ${emoji1}\n` +
			`${emoji2} ${innerMessage} ${emoji2}\n\n` +
			`Use code: ${promo.promoCode}\n` +
			`Link: ${promo.productLinks[0]}\n\n` +
			endMessage;

			await wait(ms('5s'));
			await fbPage.keyboard.type(msg);

			await wait (ms('30s'));

			try {
				let submitButton = await fbPage.waitForSelector('aria/Post');
				await submitButton.click();
			}
			catch {
				console.log('Failed to post something on Facebook. Refreshing now...');
				await fbPage.goto('https://www.facebook.com/groups/amazeballdeals');
			}

			await wait(ms('15s'));
			let innerText = await fbPage.evaluate(() => {
				/* eslint-disable-next-line no-undef */
				return document.querySelector('body').innerText;
			});

			let flagged = innerText.includes('We limit how often you can post, comment or do other things in a given amount of time in order to help protect the community from spam. You can try again later.');
			if (flagged) {
				console.log('Facebook flagged bot for spam. Trying again in 30 minutes.');

				i--;

				let links = await fbPage.$$eval('a', (as) => as.map((a) => a.href))
					.then((r) => r.filter((l) => CONTACT_LINK.test(l) )).catch(() => {});
				let link = links[0];
				await fbPage.close();

				let submitFeedback = await browser.newPage();
				await submitFeedback.goto(link);

				try {
					const explainError = await submitFeedback.waitForSelector('aria/Please explain why you think this was an error');
					await explainError.type('All I was doing was posting amazon deals for my Facebook page.');
					const submit = await submitFeedback.waitForSelector('aria/Send');
					await submit.click();
				} catch {
					console.log('Error submitting feedback to facebook');
				}

				await submitFeedback.close();
				fbPage = await facebookLogin(browser);
				await wait(ms('28m'));
			}

			await wait(ms('1.5m'));
		}
	}
	await fbPage.close();
	return;
};