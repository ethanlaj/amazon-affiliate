module.exports = {
	enabled: true,

	run: async function (page) {
		if (!module.exports.enabled)
			return;

		await page.setRequestInterception(true);
		page.on('request', (req) => {
			if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
				req.abort();
			}
			else {
				req.continue();
			}
		});

		return;
	},
};