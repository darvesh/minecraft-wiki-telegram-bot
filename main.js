const telegraf = require("telegraf");
const { Markup } = telegraf;
const { readFileSync } = require("fs");
const fuse = require("fuse.js");

const { BOT_TOKEN } = require("./config");

const bot = new telegraf(BOT_TOKEN);

const fileContent = readFileSync("./urls.json", {
	encoding: "utf8",
	flag: "r",
});
const parsed = JSON.parse(fileContent);
const names = parsed.map((p) => p.content);
const index = fuse.createIndex(["content"], names);
const fuseInstance = new fuse(
	names,
	{
		minMatchCharLength: 3,
		shouldSort: true,
		threshold: 0.6,
	},
	index
);

/**
 * formats the name, url and description
 * @param {item} param0
 */
const format = ({
	file_id,
	content,
	description,
	url,
}) => `<a href='${file_id}'>‍</a><b>${content.replace(/_/g, " ")}</b> 
<i>${description}</i>
<a href="${url}">Visit Wiki Page</a>`;

bot.on(
	"inline_query",
	async ({ inlineQuery: { query, id }, answerInlineQuery }) => {
		try {
			const searchResult = fuseInstance.search(query).slice(0, 4).reverse();
			const results = searchResult.map(({ item, refIndex }, idx) => {
				return {
					inline_query_id: id,
					id: refIndex,
					type: "article",
					thumb_url: parsed[refIndex].file_id,
					caption: `${item.replace(/_/g, " ")} \n${parsed[refIndex].url}`,
					title: item.replace(/_/g, " "),
					parse_mode: "HTML",
					message_text: format(parsed[refIndex]),
				};
			});
			return answerInlineQuery(results);
		} catch (error) {
			console.log(error.message);
		}
	}
);

bot.launch();
