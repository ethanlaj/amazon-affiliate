module.exports.run = function (ms) {
	let p = new Promise((resolve) => {
		setTimeout(() => {
			resolve('Finished wait');
		}, ms);
	});

	return p;
};