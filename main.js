const telegraf = require("telegraf");
const fuse = require("fuse.js");

const { BOT_TOKEN } = require("./config");
const { getInfoJSON } = require("./info");

const bot = new telegraf(BOT_TOKEN);

const parsed = require("./wiki.json");
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

const format = ({
	file_id,
	content,
	description,
}) => `<a href='${file_id}'>‍</a><b>${content.replace(/_/g, " ")}</b>
<i>${description}</i>`;

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
					message_text: parsed[refIndex],
				};
			});
			const withProps = [];
			for (const result of results) {
				const props = await getInfoJSON(result.title);
				console.log(`${format(result.message_text)} \n${props}`);
				withProps.push({
					...result,
					message_text: `${format(result.message_text)} \n${props} \n<a href="${
						result.message_text.url
					}">Visit Wiki Page</a>`,
				});
			}
			return answerInlineQuery(withProps);
		} catch (error) {
			console.log(error.message);
		}
	}
);

bot.command("blocks", ({ replyWithDocument }) =>
	replyWithDocument(
		"https://gamepedia.cursecdn.com/minecraft_gamepedia/1/19/Block_overview.png"
	)
);
bot.command("brewing", ({ replyWithDocument }) =>
	replyWithDocument(
		"https://gamepedia.cursecdn.com/minecraft_gamepedia/thumb/7/7b/Minecraft_brewing_en.png/400px-Minecraft_brewing_en.png"
	)
);
bot.command("start", ({ reply }) =>
	reply(
		"It's an inline bot. Please type @mcwikibot<space>query. \nFor help /help"
	)
);
bot.command("help", ({ reply }) =>
	reply("Available Commands \n/blocks\n/brewing")
);

bot.launch();
