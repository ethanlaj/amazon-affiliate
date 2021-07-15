import ms from 'ms';

import { run as doNotLoad } from './doNotLoad.js';
import { amazon as passwords } from './passwords.js';

export let run = async function (browser) {
	let page = await browser.newPage();
	page.setDefaultTimeout(ms('3m'));

	await doNotLoad(page);

	await page.goto('https://affiliate-program.amazon.com/home/promohub/promocodes');

	try {
		await page.type('#ap_email', passwords.email).catch(() => {});
		await page.type('#ap_password', passwords.pw);

		await Promise.all([
			page.waitForNavigation(),
			page.click('#signInSubmit')
		]);
	} catch {() => {};}

	return page;
};