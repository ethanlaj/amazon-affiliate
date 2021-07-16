import { run as newBrowser } from './newBrowser.js';
import { run as getRawPromos } from './getRawPromos.js';
import { run as createPromos } from './createPromos.js';
import { run as post } from './post.js';
import { run as wait } from './wait.js';
import { settings } from './settings.js';

console.log(settings);

import ms from 'ms';

async function close (browser) {
	browser.closed = true;
	return await browser.close().catch(() => {});
}

import PQueue from 'p-queue';
let promoQueue = new PQueue({ concurrency: 1 });

async function getAndCreatePromos(browser, startPage, pagesAtTime) {
	try {
		if (browser.closed)
			browser = await newBrowser();

		let rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

		return await createPromos(browser, rawPromos);
	} catch (e) {
		console.log(e);
		console.log('\nSomething went wrong with creating promotions, retrying again in 15 seconds..\n\n');

		close(browser);

		await wait(ms('15s'));

		return await getAndCreatePromos(browser, startPage, pagesAtTime);
	}
}

async function initiate(facebookLoginInfo, startPage, pagesAtTime, maxPage, browser) {
	if (startPage >= maxPage)
		startPage = maxPage - 50;

	console.log(`Running initiate script: login=${facebookLoginInfo.id}, startPage=${startPage}, pagesAtTime=${pagesAtTime}, maxPage=${maxPage}`);

	let promos = await promoQueue.add(() => getAndCreatePromos(browser, startPage, pagesAtTime));

	await post(browser, promos, facebookLoginInfo);

	await close(browser);

	initiate(facebookLoginInfo, startPage + pagesAtTime, pagesAtTime, maxPage);
}

async function start() {
	let initialPage = 1;

	for (let login of settings.facebookLogins) {
		let browser = await newBrowser();

		let maxPage = initialPage + 50;

		initiate(login, initialPage, 10, maxPage, browser);

		initialPage += 50;

		await wait(ms('2s'));
	}
}

start();