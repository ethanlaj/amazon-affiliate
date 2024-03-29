/* eslint-disable no-useless-escape */

import { run as doNotLoad } from "../utility/doNotLoad.js";
import { settings } from "../settings.js";
import ms from "ms";

const START_DATE = /(?<=Start Date:\n\u003c\/span\u003e )[A-Za-z]{3,5} [0-9]{2}, [0-9]{4} at [0-9]{2}:[0-9]{2} [A-Za-z]{2} P[A-Z]{1}T/,
	END_DATE = /(?<=End Date:\n\u003c\/span\u003e )[A-Za-z]{3,5} [0-9]{2}, [0-9]{4} at [0-9]{2}:[0-9]{2} [A-Za-z]{2} P[A-Z]{1}T/,
	PROMO_CODE = /(?<=with promo code )[A-Za-z0-9]{6,10}/,
	PROMO_LINK = /(?<=href=\")https:\/\/www.amazon.com\/promocode\/[A-Z0-9]+(?<!\")/,
	PROMO_DESC = /(?=Save)(.*)(?=\n)/,
	PERCENT = /(?<=Save )(.*)(?=%)/,
	PRODUCT_LINK = /https:\/\/www.amazon.com\/dp\/(.*)(?=&ref=mpc_asin_title)/;

export let run = async function (browser, rawPromos) {
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
				startTimestamp: Date.parse(startDate[0].replace("at", "")),
				endTimestamp: Date.parse(endDate[0].replace("at", "")),
				promoCode: promoCode[0],
				promoLink: promoLink[0],
				promoDesc: promoDesc[0],
				percent: Number(percent[0]),
				tries: 0,
				posted: false,
			});
	}

	let promoPage = await browser.newPage();
	promoPage.setDefaultTimeout(ms("2m"));

	await doNotLoad(promoPage);

	for (let promo of promos) {
		await promoPage.goto(promo.promoLink);
		let links = await promoPage.$$eval("a", (as) => as.map((a) => a.href))
			.then((r) => r.filter((l) => PRODUCT_LINK.test(l))).catch(() => { });

		let formattedLinks = [];
		for (let link of links)
			formattedLinks.push(PRODUCT_LINK.exec(link)[0] + `&tag=${settings.store}`);
		promo.productLinks = formattedLinks;
	}

	await promoPage.close();

	let finalPromos = [];
	for (let i = 0; i < promos.length; i++)
		if (promos[i].productLinks.length > 0 && !finalPromos.find((p) => p.productLinks[0] === promos[i].productLinks[0]))
			finalPromos.push(promos[i]);

	return finalPromos;
};