import { JSDOM } from "jsdom";
import axios from "axios";
import { zip, pipe, trim } from "ramda";

import { escapablesURL, picks, divider } from "../constants";
import { escape } from "../utils";

const urlRegex = new RegExp(`(${escapablesURL.join("|")})`, "g");
const escapeURL = (text: string) => text.replace(urlRegex, "\\$1");

const downloadPage = async (url: string) => {
	const response = await axios.get<string>(url).then(res => res.data);
	const dom = new JSDOM(response);
	return dom;
};

const search = async (query?: string): Promise<Array<[string, string]>> => {
	const response = await axios
		.get<string[][]>(
			`https://minecraft.gamepedia.com/api.php?action=opensearch&format=json&formatversion=2&search=${query}&namespace=0%7C10000%7C10002&limit=4&suggest=true`,
			{
				headers: {
					"Referrer-Policy": "no-referrer-when-downgrade"
				}
			}
		)
		.then(res => res.data);
	if (!response[1] || !response[3]) return [];
	return zip(response[1], response[3]);
};

const getThumbnail = (dom: JSDOM): string =>
	dom.window.document
		.querySelector("meta[property='og:image']")
		?.getAttribute("content") ?? "https://kutt.it/yEdrQw";

const getDescription = (dom: JSDOM): string =>
	dom.window.document.querySelector("#mw-content-text > div > p")
		?.textContent ?? "no description";

const removeBrackets = (text: string) => text.replace(/\{|\}/g, "");

const filter = pipe(trim, escape);

const getAdditionalInfo = ({ window: { document } }: JSDOM): string => {
	const infoBox = Array.from(
		document.querySelectorAll("table > tbody > tr"),
		node =>
			node?.textContent?.split(/\s{3,}/).map(a => `${a.trim()} `) ?? []
	);
	const extract = infoBox.reduce((acc, [name, description]) => {
		if (
			name &&
			description &&
			description.trim() &&
			picks.includes(name.trim().toLowerCase())
		) {
			acc += `*${filter(name)}*: _{${filter(description)}}\\._\n${escape(
				divider
			)}\n`;
		}
		return acc;
	}, "");
	const k = removeBrackets(extract);
	return k;
};

const formatMessage = (
	itemName: string,
	imageURL: string,
	description: string,
	itemPageURL: string,
	additionalInfo: string
) => {
	// there is zero-width char in image url title
	const message = `*${escape(itemName)}* 
	_${escape(description)}_ [​](${escapeURL(imageURL)}) \n${additionalInfo}
	[Visit Wiki Page](${escapeURL(itemPageURL)})`;
	return message;
};

export {
	search,
	downloadPage,
	getThumbnail,
	getDescription,
	formatMessage,
	getAdditionalInfo
};
