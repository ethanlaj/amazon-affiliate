module.exports.run = function (page) {
	page.on('console', (msg) => {
		console.log('console\n' + msg);
	});

	page.on('error', (msg) => {
		console.log('error\n' + msg);
	});

	page.on('pageerror', (msg) => {
		console.log('pageerror\n' + msg);
	});

	page.on('requestfailed', (msg) => {
		console.log('requestfailed\n' + msg);
	});

	page.on('requestfailed', (msg) => {
		console.log('requestfailed\n' + msg);
	});
};