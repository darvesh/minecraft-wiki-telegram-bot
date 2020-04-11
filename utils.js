const fetch = require("node-fetch");
const { JSDOM } = require("jsdom");

const getThumbnail = async (url) => {
	try {
		const res = await fetch(url).then((res) => res.text());
		const dom = new JSDOM(res);
		const imageURL = dom.window.document.querySelector(
			"meta[property='og:image']"
		).content;
		if (imageURL) return imageURL;
		return "https://www.pngitem.com/pimgs/m/22-223516_minecraft-net-logo-hd-png-download.png";
	} catch (error) {
		console.error(error.message);
		return "https://www.pngitem.com/pimgs/m/22-223516_minecraft-net-logo-hd-png-download.png";
	}
};

const getDescription = async (url) => {
	try {
		const res = await fetch(url).then((res) => res.text());
		const dom = new JSDOM(res);
		const description = dom.window.document.querySelector(
			"#mw-content-text > div > p"
		).textContent;
		if (description) return description;
		return "no description";
	} catch (error) {
		console.error(error.message);
		return "no description";
	}
};

module.exports = {
	getThumbnail,
	getDescription
};
