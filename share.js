import { run as wait } from './wait.js';
import ms from 'ms';

export let run = async function (fbPage) {
	let share = await fbPage.waitForSelector('[aria-label="Send this to friends or post it on your timeline."]');
	await share.click();
	await wait(ms('15s'));

	let elements = await fbPage.$$('*');

	for (let element of elements) {
		let innerText = await element.getProperty('innerText').then(async (p) => await p.jsonValue());
		if (innerText === 'Share now (Only me)') {
			await element.click().catch(() => {});
		}
	}

	return;
};