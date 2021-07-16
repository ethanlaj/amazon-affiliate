import ms from 'ms';
import { settings } from './settings.js';
//import { run as doNotLoad } from './doNotLoad.js';

export let run = async function (browser, loginInfo) {
	let page = await browser.newPage();
	page.setDefaultTimeout(ms('1m'));

	await page.setViewport({
		width: 1500,
		height: 900,
	});

	//await doNotLoad(page);

	try {
		await page.goto(settings.linkToGroup);

		let email = await page.waitForSelector('aria/Email or Phone');
		await email.type(loginInfo.email);

		let password = await page.waitForSelector('aria/Password');
		await password.type(loginInfo.pw);

		let loginButton = await page.waitForSelector('aria/Accessible login button');

		await Promise.all([
			page.waitForNavigation(),
			loginButton.click(),
		]);
	} catch {() => {};}

	return page;
};