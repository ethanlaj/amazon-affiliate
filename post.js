import { run as wait } from './wait.js';
import { run as facebookLogin } from './facebookLogin.js';
import { run as checkTimes } from './checkTimes.js';
import { run as checkFlagged } from './checkFlagged.js';
import { run as noSalesPost } from './noSalesPost.js';
import { settings } from './settings.js';

import ms from 'ms';

import PQueue from 'p-queue';
let postQueue = new PQueue({ concurrency: 1 });

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

let endMsg = '#ad - Codes and discounts are valid at the time of posting and can expire at ANY time.';

async function postToFB (browser, loginInfo, promo) {
	let fbPage;

	try {
		if (promo.productLinks[0] && checkTimes(promo) && promo.tries <= settings.numberOfPostTries) {
			fbPage = await facebookLogin(browser, loginInfo);

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
					endMsg;

			await wait(ms('35s'));
			let typeHere = await fbPage.$$('aria/Create a public post…');

			typeHere = typeHere.find((e) => e._remoteObject.description.startsWith('div.notranslate'));
			if (!typeHere)
				throw new Error('Could not find post typing space.');
			await typeHere.type(msg);

			let embedded = false;
			let tries = 0;
			let linkedTwice = false;
			while (!embedded) {
				if (tries === 10) {
					if (linkedTwice)
						throw new Error('Could not create link embed.');

					await typeHere.type('\n\n\n\n' + promo.productLinks[0]);
					tries = 0;
					linkedTwice = true;
				}
				tries++;

				await wait(ms('5s'));

				let links = await fbPage.$$eval('a', (as) => as.map((a) => a.href));

				embedded = links.find((l) => l.includes(promo.productLinks[0].split('?')[0].split('dp/')[1]));
			}

			let submitButton = await fbPage.waitForSelector('aria/Post');
			await submitButton.click();

			promo.posted = true;

			await wait(ms('8s'));
			let flagged = await checkFlagged(browser, fbPage);
			if (flagged) {
				promo.tries--;

				return 'Flagged';
			} else {
				await wait(ms('40s'));

				await noSalesPost(fbPage);
			}

			let likeButtons = await fbPage.$$('aria/Like');
			for (let likeButton of likeButtons)
				await likeButton.click().catch(() => {});

			await wait(ms('15s'));

			await fbPage.close().catch(() => {});

			return;
		} else return;
	} catch (e) {
		await fbPage.close().catch(() => {});

		if (promo.posted)
			return;
		else {
			return await postToFB(browser, loginInfo, promo);
		}
	}
}

export let run = async function (browser, promos, loginInfo) {
	for (let i = 0; i < promos.length; i++) {
		let post = await postQueue.add(() => postToFB(browser, loginInfo, promos[i]));

		if (post === 'Flagged') {
			await wait(ms('20m'));
			i--;
		}
	}

	await wait(ms('10s'));

	await browser.close();

	return;
};