export let settings = {
	store: "amazeballdeal-20",
	linkToGroup: "https://www.facebook.com/groups/amazeballdeals",
	numberOfPostTries: 5,
	restrictTimes: true,
	postStartTime: "6:00",
	postEndTime: "24:00",
	// Time before a deal expires that the bot will post on Facebook
	fbExpireTime: "2h",
	// Time before a deal expires that the bot will signal that the deal is TikTok ready
	ttExpireTime: "7d",
	amazonLogin: {
		email: process.env.AMAZON_EMAIL,
		pw: process.env.AMAZON_PW,
	},
	facebookLogins: [
		{
			id: 1,
			email: process.env.FB_EMAIL,
			pw: process.env.FB_PW,
		},
	],
};