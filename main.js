const newBrowser = require('./newBrowser').run,
	getRawPromos = require('./getRawPromos').run,
	createPromos = require('./createPromos').run,
	post = require('./post').run,
	wait = require('./wait').run,
	passwords = require('./passwords').facebook;


let ms = require('ms');

async function initiate(facebookLoginInfo, startPage, pagesAtTime, maxPage, browser) {
	if (startPage >= maxPage)
		startPage = maxPage - 50;

	console.log(`Running initiate script: login=${facebookLoginInfo.id}, startPage=${startPage}, pagesAtTime=${pagesAtTime}, maxPage=${maxPage}`);

	if (!browser)
		browser = await newBrowser();

	let rawPromos;
	let promos;

	try {
		rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

		promos = await createPromos(browser, rawPromos);
	} catch {
		console.log('Something went wrong with creating promotions, retrying again in 15 seconds..');

		await browser.close();

		browser = undefined;

		await wait(ms('15s'));

		return initiate(facebookLoginInfo, startPage, pagesAtTime, maxPage, browser);
	}

	await post(browser, promos, facebookLoginInfo);

	await browser.close();

	browser = undefined;

	initiate(facebookLoginInfo, startPage + pagesAtTime, pagesAtTime, maxPage);
}

async function start() {
	let initialPage = 1;

	for (let login of passwords) {
		let browser;

		let maxPage = initialPage + 50;

		initiate(login, initialPage, 10, maxPage, browser);

		initialPage += 50;

		await wait(ms('20m'));
	}
}

start();