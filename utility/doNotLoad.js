export let run = async function (page) {
	await page.setRequestInterception(true);
	page.on("request", (req) => {
		if (req.resourceType() == "stylesheet" || req.resourceType() == "font" || req.resourceType() == "image") {
			req.abort();
		}
		else {
			req.continue();
		}
	});

	return;
};