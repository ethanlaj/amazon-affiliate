const newBrowser = require('./newBrowser').run,
	getRawPromos = require('./getRawPromos').run,
	createPromos = require('./createPromos').run,
	post = require('./post').run,
	wait = require('./wait').run;

let ms = require('ms');

let browser;

async function initiate(startPage, pagesAtTime) {
	if (startPage >= 50)
		startPage = 1;

	console.log(`Running initiate script: startPage=${startPage}, pagesAtTime=${pagesAtTime}`);

	if (!browser)
		browser = await newBrowser();

	let rawPromos;
	let promos;

	try {
		rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

		promos = await createPromos(browser, rawPromos);
	} catch {
		console.log('Something went wrong with creating promotions, retrying again in 1 minute..');

		await browser.close();

		browser = undefined;

		await wait(ms('1m'));

		return initiate(startPage, pagesAtTime);
	}

	await post(browser, promos);

	initiate(startPage + pagesAtTime, pagesAtTime);
}

initiate(1, 10);

