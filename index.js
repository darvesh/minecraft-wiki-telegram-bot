const telegraf = require("telegraf");

const { BOT_TOKEN } = require("./config");
const {
	search,
	downloadPage,
	getThumbnail,
	getDescription,
	formatMessage,
	escape,
} = require("./utils");

const bot = new telegraf(BOT_TOKEN);

bot.on(
	"inline_query",
	async ({ inlineQuery: { query, id }, answerInlineQuery }) => {
		const result = await search(query);
		const response = await Promise.all(
			result.map(async ([itemName, itemPageLink], index) => {
				const dom = await downloadPage(itemPageLink);
				const description = await getDescription(dom);
				const imageURL = await getThumbnail(dom);
				const formattedMessage = formatMessage(
					itemName,
					imageURL,
					description,
					itemPageLink
				);
				return {
					inline_query_id: id,
					id: index,
					type: "article",
					thumb_url: imageURL,
					caption: escape(itemName),
					title: escape(itemName),
					parse_mode: "MarkdownV2",
					message_text: formattedMessage,
					cache_time: 0,
				};
			})
		);
		return answerInlineQuery(response);
	}
);

bot.launch();
