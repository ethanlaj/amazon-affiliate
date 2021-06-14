const amazonLogin = require('./amazonLogin').run;

const START_DATE = /(?<=Start Date:\n<\/span> )[A-Za-z]{3,5} [0-9]{2}, [0-9]{4} at [0-9]{2}:[0-9]{2} [A-Za-z]{2} PDT/;

module.exports.run = async function (browser, startPage, pagesAtTime) {
	let azPage = await amazonLogin(browser);

	let rawPromos = [];

	for (let i = startPage; i < startPage + pagesAtTime; i++) {
		await azPage.goto(`https://affiliate-program.amazon.com/home/promohub/promocodes/mpc?ac-ms-src=nav&type=mpc&active_date_range=0&serial=&is_featured_promotions=0&store_id=amazeballdeal-20&page=${i}`);

		let innerText = await azPage.evaluate(() => {
			/* eslint-disable-next-line no-undef */
			return JSON.parse(document.querySelector('body').innerText);
		});

		innerText = innerText.search_result.split('</div></div></div>');
		for (let i = innerText.length - 1; i >= 0; i--) {
			if (!START_DATE.test(innerText[i]))
				innerText.splice(i, 1);
		}
		rawPromos.push(...innerText);
	}
	await azPage.close();

	return rawPromos;
};