const newBrowser = require('./newBrowser').run,
	getRawPromos = require('./getRawPromos').run,
	createPromos = require('./createPromos').run,
	post = require('./post').run;

let browser;

async function initiate(startPage, pagesAtTime) {
	console.log(`Running initiate script: startPage=${startPage}, pagesAtTime=${pagesAtTime}`);

	if (!browser)
		browser = await newBrowser();

	let rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

	let promos = await createPromos(browser, rawPromos);

	await post(browser, promos);

	initiate(startPage + pagesAtTime, pagesAtTime);
}

initiate(1, 10);

