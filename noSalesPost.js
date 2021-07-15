import { run as wait } from './wait.js';
import ms from 'ms';

export let run = async function (fbPage) {
	let after = await fbPage.$$('[aria-label="Actions for this post"]');
	await after[0].click();

	await wait(ms('15s'));

	let elements = await fbPage.$$('*');

	for (let element of elements) {
		let innerText = await element.getProperty('innerText').then(async (p) => await p.jsonValue());
		if (innerText === 'Turn off sale format\nThis will remove features from this post') {
			await element.click().catch(() => {});
		}
	}

	await after[0].click();

	return;
};