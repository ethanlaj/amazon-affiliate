const newBrowser = require('./newBrowser').run,
	getRawPromos = require('./getRawPromos').run,
	createPromos = require('./createPromos').run,
	post = require('./post').run,
	wait = require('./wait').run,
	passwords = require('./passwords').facebook;


let ms = require('ms');

let browser;

async function initiate(facebookLoginInfo, startPage, pagesAtTime, maxPage) {
	if (startPage >= maxPage)
		startPage = 1;

	console.log(`Running initiate script: startPage=${startPage}, pagesAtTime=${pagesAtTime}, login=${facebookLoginInfo.id}`);

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

		return initiate(startPage, pagesAtTime);
	}

	await post(browser, promos, facebookLoginInfo);

	await browser.close();

	browser = undefined;

	initiate(facebookLoginInfo, startPage + pagesAtTime, pagesAtTime, maxPage);
}

async function start() {
	let initialPage = 1;

	for (let login of passwords) {
		let maxPage = initialPage + 50;

		initiate(login, initialPage, 10, maxPage);

		initialPage += 50;

		await wait(ms('10m'));
	}
}

start();