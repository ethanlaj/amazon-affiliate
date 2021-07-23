import ms from 'ms';

export let run = function (promo) {
	if (promo.startTimestamp && promo.endTimestamp &&
        Date.now() >= promo.startTimestamp &&
        promo.endTimestamp - Date.now() > ms('2h'))
		return true;
	return false;
};