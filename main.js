let newBrowser = require('./newBrowser').run,
	getRawPromos = require('./getRawPromos').run,
	createPromos = require('./createPromos').run,
	post = require('./post').run,
	wait = require('./wait').run,
	passwords = require('./passwords').facebook,
	promises = require('./promises');


let ms = require('ms');

async function initiate(facebookLoginInfo, startPage, pagesAtTime, maxPage, browser) {
	if (startPage >= maxPage)
		startPage = maxPage - 50;

	console.log(`Running initiate script: login=${facebookLoginInfo.id}, startPage=${startPage}, pagesAtTime=${pagesAtTime}, maxPage=${maxPage}`);

	if (!browser)
		browser = await newBrowser();

	let rawPromos;
	let promos;

	let promoPromise = new Promise(async (resolve) => {
		await Promise.all(promises.create);

		console.log(promises.create);

		try {
			rawPromos = await getRawPromos(browser, startPage, pagesAtTime);

			promos = await createPromos(browser, rawPromos);

			resolve('Finished creating promos ' + facebookLoginInfo.id + ' - - - ' + promos.length);
		} catch {
			console.log('\nSomething went wrong with creating promotions, retrying again in 15 seconds..\n\n');

			await browser.close();

			browser = undefined;

			await wait(ms('15s'));

			resolve('Error creating promos ' + facebookLoginInfo.id);

			return initiate(facebookLoginInfo, startPage, pagesAtTime, maxPage, browser);
		}
	});

	promises.create.push(promoPromise);

	await promoPromise;

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

		initiate(login, initialPage, 2, maxPage, browser);

		initialPage += 50;

		await wait(ms('3s'));
	}
}

start();