const newBrowser = require('./newBrowser').run,
	getRawPromos = require('./getRawPromos').run,
	createPromos = require('./createPromos').run,
	post = require('./post').run;

async function initiate(startPage, pagesAtTime) {
	console.log(`Running initiate script: startPage=${startPage}, pagesAtTime=${pagesAtTime}`);
	let browser = await newBrowser();

	let rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

	let promos = await createPromos(browser, rawPromos);

	await post(browser, promos);

	await browser.close();

	initiate(startPage + pagesAtTime, pagesAtTime);
}

initiate(1, 10);

