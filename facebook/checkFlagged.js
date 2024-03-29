const CONTACT_LINK = /https:\/\/www.facebook.com\/help\/contact\/[0-9]+\?additional_content=/;
import { run as doNotLoad } from "../utility/doNotLoad.js";
import { run as wait } from "../utility/wait.js";

export let run = async function (browser, fbPage) {
	let innerText = await fbPage.evaluate(() => {
		/* eslint-disable-next-line no-undef */
		return document.querySelector("body").innerText;
	});

	let flagged = innerText.includes("We limit how often you can post, comment or do other things in a given amount of time in order to help protect the community from spam. You can try again later.") ||
		innerText.includes("You're temporarily restricted from posting to groups") ||
		innerText.includes("You Can't Post In Groups Right Now");

	if (flagged) {
		let links = await fbPage.$$eval("a", (as) => as.map((a) => a.href))
			.then((r) => r.filter((l) => CONTACT_LINK.test(l))).catch(() => { });
		let link = links[0];

		// Disagree buttons:
		fbPage.evaluate(() => {
			let spans = Array.from(document.querySelectorAll("span"));
			spans = spans.filter(s => s.innerText == "Disagree With Decision");

			if (spans.length > 0) {
				spans[0].click();
			}
		}).catch(() => { });
		//

		await wait("20000");

		await fbPage.close().catch(() => { });

		if (!link)
			return true;

		let submitFeedback = await browser.newPage();
		await doNotLoad(submitFeedback);

		await submitFeedback.goto(link, {
			waitUntil: "networkidle0",
		});

		try {
			let explainError = await submitFeedback.$$("aria/Please explain why you think this was an error");

			explainError = explainError.find((e) => e._remoteObject.description.startsWith("textarea#"));
			if (!explainError)
				throw new Error("Could not find flagged typing space.");

			await explainError.type("All I was doing was posting amazon deals for my Facebook page.");

			let submit = await submitFeedback.waitForSelector("aria/Send");
			await submit.click();
		} catch (e) {
			console.log("Error submitting feedback to facebook");
		}

		await submitFeedback.close();

		return true;
	}

	return false;
};