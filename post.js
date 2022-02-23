import { run as wait } from './wait.js';
import { run as facebookLogin } from './facebookLogin.js';
import { run as checkTimes } from './checkTimes.js';
import { run as checkFlagged } from './checkFlagged.js';
import { run as noSalesPost } from './noSalesPost.js';
import { run as share } from './share.js';
import { ProgressBar } from './progressBar.js';
import { settings } from './settings.js';
import { active } from './restrictTimes.js';

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
	'Take a look at this deal!',
	'This is a must have item!',
	'Let me know if you snag this deal!',
	'Let me know if you want to keep seeing these deals!',
	'What a great deal!',
	'Let me know if you order this!',
];

let endMsg = '#ad - Codes and discounts are valid at the time of posting and can expire at ANY time.';

async function postToFB (browser, loginInfo, promo) {
	let fbPage;
	let postStatus = checkTimes(promo);

	try {
		if (promo.productLinks[0] && postStatus > 0 && promo.tries <= settings.numberOfPostTries) {
			fbPage = await facebookLogin(browser, loginInfo);

			promo.tries++;

			let createPostButton = await fbPage.waitForSelector('aria/Write something...');
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
					`${postStatus === 2 ? '🔗' : 'Link'}: ${promo.productLinks[0]}\n\n` +
					`${postStatus === 2 ? '#awesome ' : ''}` +
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
			let links;
			while (!embedded) {
				if (tries === 10) {
					if (linkedTwice) {
						console.log('\n\n\n---------------------------------------------------');
						console.log(promo.productLinks[0].split('?')[0].split('dp/')[1]);
						console.log(links);
						console.log('Link embed not found, going to assume embed is showing anyways.');
						console.log('---------------------------------------------------\n\n\n');

						embedded = true;
						break;
					}

					await typeHere.type('\n\n\n\n' + promo.productLinks[0]);
					tries = 0;
					linkedTwice = true;
				}
				tries++;

				await wait(ms('5s'));

				links = await fbPage.$$eval('a', (as) => as.map((a) => a.href));

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

			let comment = await fbPage.waitForSelector('aria/Write a comment');
			await comment.type(promo.promoCode);
			await comment.focus();
			await fbPage.keyboard.press('Enter');

			let secondsToWait = Math.floor(Math.random() * (100 - 35 + 1) + 35);
			await wait(ms(`${secondsToWait}s`));

			if (postStatus === 2) {
				await share(fbPage);
				await wait(ms('10s'));
			}

			await fbPage.close().catch(() => {});

			return;
		} else return;
	} catch (e) {
		console.log(e);
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
		if (!active)
			break;

		let post = await postQueue.add(() => postToFB(browser, loginInfo, promos[i]));

		if (post === 'Flagged') {
			console.log('Facebook flagged bot for spam. Trying again in 20 minutes.');
			new ProgressBar().start();
			await wait(ms('20m'));
			i--;
		}
	}

	await wait(ms('10s'));

	await browser.close();

	return;
};
