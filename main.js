const newBrowser = require('./newBrowser').run,
	getRawPromos = require('./getRawPromos').run,
	createPromos = require('./createPromos').run,
	post = require('./post').run,
	facebookLogin = require('./facebookLogin').run,
	amazonLogin = require('./amazonLogin').run;


let browser = newBrowser();

async function initiate(startPage, pagesAtTime) {
	console.log(`Running initiate script: startPage=${startPage}, pagesAtTime=${pagesAtTime}`);
	await browser;

	await amazonLogin().then((p) => p.close());
	await facebookLogin().then((p) => p.close());

	let rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

	let promos = await createPromos(browser, rawPromos);

	await post(browser, promos);

	initiate(startPage + pagesAtTime, pagesAtTime);
}

initiate(1, 25);

