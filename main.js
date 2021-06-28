const newBrowser = require('./newBrowser').run,
	getRawPromos = require('./getRawPromos').run,
	createPromos = require('./createPromos').run,
	post = require('./post').run,
	wait = require('./wait').run;

let ms = require('ms');

let browser;

async function initiate(startPage, pagesAtTime) {
	/*if (startPage >= 51)
		startPage = 1;

	console.log(`Running initiate script: startPage=${startPage}, pagesAtTime=${pagesAtTime}`);
*/
	if (!browser)
		browser = await newBrowser();

	/*let rawPromos;
	let promos;

	try {
		console.log('Running raw promos...');
		rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

		console.log('Running create promos...');
		promos = await createPromos(browser, rawPromos);
	} catch {
		console.log('Something went wrong with creating promotions, retrying again in 1 minute..');

		await browser.close();

		browser = undefined;

		await wait(ms('1m'));

		return initiate(startPage, pagesAtTime);
	}

	console.log('Running post...');*/

	//await post(browser, promos);
	await post(browser);

	console.log('All promos have been posted, closing browser...');
	//await browser.close();

	browser = undefined;

	//initiate(startPage + pagesAtTime, pagesAtTime);
}

initiate(1, 10);

