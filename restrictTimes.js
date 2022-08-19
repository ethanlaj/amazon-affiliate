import { settings } from "./settings.js";

let startTime = settings.postStartTime;
let endTime = settings.postEndTime;

export let active = false;

export let run = function () {
	let currentDate = new Date();

	let startDate = new Date(currentDate.getTime());
	startDate.setHours(startTime.split(":")[0]);
	startDate.setMinutes(startTime.split(":")[1]);

	let endDate = new Date(currentDate.getTime());
	endDate.setHours(endTime.split(":")[0]);
	endDate.setMinutes(endTime.split(":")[1]);

	return startDate < currentDate && endDate > currentDate;
};

function check() {
	if (settings.restrictTimes)
		active = run();
	else
		active = true;
}

check();
setInterval(check, 10000);
