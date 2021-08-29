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

		let email = await page.waitForSelector('[type="email"]');
		await email.type(loginInfo.email);

		let password = await page.waitForSelector('[type="password"]');
		await password.type(loginInfo.pw);

		//let loginButton = await page.waitForSelector('aria/Accessible login button');

		await Promise.all([
			page.waitForNavigation(),
			page.keyboard.press('Enter'),
		]);
	} catch {() => {};}

	return page;
};
