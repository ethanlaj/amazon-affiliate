import { run as newBrowser } from './newBrowser.js';
import { run as getRawPromos } from './getRawPromos.js';
import { run as createPromos } from './createPromos.js';
import { run as post } from './post.js';
import { run as wait } from './wait.js';
import { settings } from './settings.js';

import ms from 'ms';

async function reopen(browser) {
	await browser.close().catch(() => {});

	return await newBrowser();
}

import PQueue from 'p-queue';
let promoQueue = new PQueue({ concurrency: 1 });

async function getAndCreatePromos(browser, startPage, pagesAtTime) {
	try {
		let rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

		let finalPromos = await createPromos(browser, rawPromos);

		await browser.close();

		return finalPromos;
	} catch (e) {
		console.log(e);
		console.log('\nSomething went wrong with creating promotions, retrying again in 15 seconds..\n\n');

		browser = await reopen(browser);

		await wait(ms('15s'));

		return await getAndCreatePromos(browser, startPage, pagesAtTime);
	}
}

async function initiate(facebookLoginInfo, startPage, pagesAtTime, maxPage, browser) {
	if (startPage >= maxPage)
		startPage = maxPage - 50;

	console.log(`Running initiate script: login=${facebookLoginInfo.id}, startPage=${startPage}, pagesAtTime=${pagesAtTime}, maxPage=${maxPage}`);

	let promos = await promoQueue.add(() => getAndCreatePromos(browser, startPage, pagesAtTime));

	browser = await reopen(browser);

	await post(browser, promos, facebookLoginInfo);

	browser = await reopen(browser);

	initiate(facebookLoginInfo, startPage + pagesAtTime, pagesAtTime, maxPage, browser);
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