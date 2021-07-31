import { run as newBrowser } from './newBrowser.js';
import { run as getRawPromos } from './getRawPromos.js';
import { run as createPromos } from './createPromos.js';
import { run as post } from './post.js';
import { run as wait } from './wait.js';
import { settings } from './settings.js';
import { active } from './restrictTimes.js';

import ms from 'ms';

import PQueue from 'p-queue';
let promoQueue = new PQueue({ concurrency: 1 });

async function getAndCreatePromos(startPage, pagesAtTime) {
	let browser;

	try {
		browser = await newBrowser();

		let rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

		let finalPromos = await createPromos(browser, rawPromos);

		await browser.close();

		return finalPromos;
	} catch (e) {
		console.log('\nSomething went wrong with creating promotions, retrying again in 15 seconds..\n\n');

		await browser.close().catch(() => {});

		await wait(ms('15s'));

		return await getAndCreatePromos(startPage, pagesAtTime);
	}
}

async function initiate(facebookLoginInfo, startPage, pagesAtTime, maxPage) {
	if (startPage >= maxPage)
		startPage = maxPage - 50;

	console.log(`Running initiate script: login=${facebookLoginInfo.id}, startPage=${startPage}, pagesAtTime=${pagesAtTime}, maxPage=${maxPage}`);

	while (!active)
		await wait(ms('1m'));

	let promos = await promoQueue.add(() => getAndCreatePromos(startPage, pagesAtTime));

	let browser = await newBrowser();

	await post(browser, promos, facebookLoginInfo);

	initiate(facebookLoginInfo, startPage + pagesAtTime, pagesAtTime, maxPage);
}

async function start() {
	let initialPage = 1;

	for (let login of settings.facebookLogins) {
		let maxPage = initialPage + 50;

		initiate(login, initialPage, 10, maxPage);

		initialPage += 50;

		await wait(ms('2s'));
	}
}

start();