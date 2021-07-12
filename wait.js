module.exports.run = function (ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve('Finished wait');
		}, ms);
	});
};