import { JSDOM } from "jsdom";
import axios from "axios";
import zip from "ramda/src/zip";
import pipe from "ramda/src/pipe";
import trim from "ramda/src/trim";

const { escapablesText, escapablesURL, picks } = require("./constants");

const textRegex = new RegExp(`(${escapablesText.join("|")})`, "g");
const escape = (text: string) => text.replace(textRegex, "\\$1");

const urlRegex = new RegExp(`(${escapablesURL.join("|")})`, "g");
const escapeURL = (text: string) => text.replace(urlRegex, "\\$1");



const downloadPage = async (url: string) => {
	const response = await axios(url).then((res) => res.data);
	const dom = new JSDOM(response);
	return dom;
};

const search = async (query: string): Promise<Array<[string, string]>> => {
	const response = await axios
		.get(
			`https://minecraft.gamepedia.com/api.php?action=opensearch&format=json&formatversion=2&search=${query}&namespace=0%7C10000%7C10002&limit=4&suggest=true`,
			{
				headers: {
					"Referrer-Policy": "no-referrer-when-downgrade",
				},
			}
		)
		.then((res) => res.data);
	if (!response[1] || !response[3]) return [];
	return zip(response[1], response[3]);
};

const getThumbnail = (dom:JSDOM):string => {
	try {
		const imageURL = dom.window.document.querySelector(
			"meta[property='og:image']"
		).getAttribute("content");
		if (imageURL) return imageURL;
		throw new Error("No image found");
	} catch (error) {
		// it errors sometimes
		return "https://kutt.it/yEdrQw";
	}
};

const getDescription = (dom:JSDOM) => {
	try {
		const description = dom.window.document.querySelector(
			"#mw-content-text > div > p"
		).textContent;
		if (description) return description;
		throw new Error("No description found");
	} catch (error) {
		return "no description";
	}
};

const removeBrackets = (text:string) => text.replace(/\{|\}/g, "");

const filter = pipe(trim, escape);

const getAdditionalInfo = (dom:JSDOM):string => {
	const infoBox = Array.from(
		dom.window.document.querySelectorAll("table > tbody > tr"),
		(e) =>
			e && e.textContent
				? e.textContent.split(/\s{3,}/).map((a) => a.trim() + " ")
				: []
	);
	const extract = infoBox.reduce(
		(acc, [name, description = "not available"]) => {
			if (
				name &&
				picks.includes(name.trim().toLowerCase()) &&
				description.trim().length
			) {
				acc += `*${filter(name)}*: _{${filter(description)}}_\n${escape(
					"───────────────────────────────"
				)}\n`;
			}
			return acc;
		},
		""
	);
	return removeBrackets(extract);
};

const formatMessage = (
	itemName:string,
	imageURL:string,
	description:string,
	itemPageURL:string,
	getAdditionalInfo:string
) => {
	// there is zero-width char in image url title
	const message = `*${escape(itemName)}* 
	_${escape(description)}_ [​](${escapeURL(imageURL)}) \n${getAdditionalInfo}
	[Visit Wiki Page](${escapeURL(itemPageURL)})`;
	return message;
};

export {
	search,
	downloadPage,
	getThumbnail,
	getDescription,
	escape,
	formatMessage,
	getAdditionalInfo,
};
