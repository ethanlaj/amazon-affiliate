import ms from 'ms';
import { settings } from './settings.js';

// 0 = NO POST
// 1 = FB POST
// 2 = FB POST && TIKTOK POST

let postStatus = 0;
export let run = function (promo) {
	if (promo.startTimestamp && promo.endTimestamp &&
			Date.now() >= promo.startTimestamp &&
			promo.endTimestamp - Date.now() > ms(settings.fbExpireTime)) {
		postStatus = 1;
		if (promo.endTimestamp - Date.now() > ms(settings.ttExpireTime))
			postStatus = 2;
	}

	return postStatus;
};