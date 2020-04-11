const telegraf = require("telegraf");
const { Markup } = telegraf;
const { readFileSync } = require("fs");
const fuse = require("fuse.js");

const { BOT_TOKEN } = require("./config");

const bot = new telegraf(BOT_TOKEN);

const fileContent = readFileSync("./wiki.json", {
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

bot.on(
	"inline_query",
	async ({ inlineQuery: { query, id }, answerInlineQuery }) => {
		try {
			const searchResult = fuseInstance.search(query).slice(0, 4);
			const results = searchResult.map(({ item, refIndex }, idx) => {
				return {
					inline_query_id: id,
					id: refIndex,
					type: "article",
					thumb_url: parsed[refIndex].file_id,
					caption: `${item.replace(/_/g, " ")} \n${parsed[refIndex].url}`,
					title: item.replace(/_/g, " "),
					message_text: `${parsed[refIndex].file_id}`,
					reply_markup: Markup.inlineKeyboard([
						Markup.urlButton("Link", parsed[refIndex].url),
					
					]),
				};
			});
			return answerInlineQuery(results.reverse());
		} catch (error) {
			console.log(error.message);
		}
	}
);

bot.launch();
