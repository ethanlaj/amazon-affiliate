const START_DATE = /(?<=Start Date:\n<\/span> )[A-Za-z]{3,5} [0-9]{2}, [0-9]{4} at [0-9]{2}:[0-9]{2} [A-Za-z]{2} PDT/,
	END_DATE = /(?<=End Date:\n<\/span> )[A-Za-z]{3,5} [0-9]{2}, [0-9]{4} at [0-9]{2}:[0-9]{2} [A-Za-z]{2} PDT/,
	PROMO_CODE = /(?<=with promo code )[A-Za-z0-9]{6,10}/,
	PROMO_LINK = /(?<=href=")https:\/\/www.amazon.com\/promocode\/[A-Z0-9]+/,
	PROMO_DESC = /(?=Save)(.*)(?=\n)/,
	PERCENT = /(?<=Save )(.*)(?=%)/,
	PRODUCT_LINK = /https:\/\/www.amazon.com\/dp\/(.*)(?=&ref=mpc_asin_title)/;

function arraysEqual(a1, a2) {
	return JSON.stringify(a1)==JSON.stringify(a2);
}

module.exports.run = async function (browser, rawPromos) {
	let promos = [];

	for (let promo of rawPromos) {
		let startDate = START_DATE.exec(promo),
			endDate = END_DATE.exec(promo),
			promoCode = PROMO_CODE.exec(promo),
			promoLink = PROMO_LINK.exec(promo),
			promoDesc = PROMO_DESC.exec(promo),
			percent = PERCENT.exec(promo);


		if (startDate && endDate && promoCode && promoLink && promoDesc && percent)
			promos.push({
				startDate: startDate[0],
				endDate: endDate[0],
				promoCode: promoCode[0],
				promoLink: promoLink[0],
				promoDesc: promoDesc[0],
				percent: Number(percent[0]),
			});
	}

	let promoPage = await browser.newPage();

	for (let promo of promos) {
		await promoPage.goto(promo.promoLink);
		let links = await promoPage.$$eval('a', (as) => as.map((a) => a.href))
			.then((r) => r.filter((l) => PRODUCT_LINK.test(l) )).catch(() => {});

		let formattedLinks = [];
		for (let link of links)
			formattedLinks.push(PRODUCT_LINK.exec(link)[0] + '&tag=amazeballdeal-20');
		promo.productLinks = formattedLinks;
	}

	await promoPage.close();

	let finalPromos = [];
	for (let i = 0; i < promos.length; i++)
		if (!finalPromos.find((p) => arraysEqual(p.productLinks, promos[i].productLinks)))
			finalPromos.push(promos[i]);

	return finalPromos;
};