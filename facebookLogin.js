import ms from 'ms';
import { settings } from './settings.js';
//import { run as doNotLoad } from './doNotLoad.js';

function listen (page) {
	page.on('error', async (err) => {
		if (err.toString().startsWith('Error: Page crashed')) {
			console.log('Page crashed. Refreshing now...');

			// eslint-disable-next-line promise/no-promise-in-callback
			await page.close().catch(() => {});

			return;
		}
	});
}

export let run = async function (browser, loginInfo) {
	let page = await browser.newPage();
	page.setDefaultTimeout(ms('1m'));

	listen(page);

	//await doNotLoad(page);

	try {
		await page.goto(settings.linkToGroup);

		await page.type('[type="email"]', loginInfo.email)
			.catch(async () => await page.type('[id="email"]', loginInfo.email).catch(() => {}));

		await page.type('[type="password"]', loginInfo.pw);

		await Promise.all([
			page.waitForNavigation(),
			page.keyboard.press('Enter'),
		]);

		await page.type('[type="password"]', loginInfo.pw).then(async () => {
			await Promise.all([
				page.waitForNavigation(),
				page.keyboard.press('Enter'),
			]);
		}).catch(() => {});
	} catch {() => {};}

	return page;
};
