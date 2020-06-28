// types
import { InlineQueryResultArticle } from "telegraf/typings/telegram-types";

import telegraf from "telegraf";

import { BOT_TOKEN } from "./config";
import {
	search,
	downloadPage,
	getThumbnail,
	getDescription,
	escape,
	getAdditionalInfo,
	formatMessage
} from "./utils";

const bot = new telegraf(BOT_TOKEN);

bot.on(
	"inline_query",
	async ({ inlineQuery: { query } = { query: "" }, answerInlineQuery }) => {
		const result = await search(query);
		const response = await Promise.all(
			result.map(
				async (
					[itemName, itemPageLink],
					index: number
				): Promise<InlineQueryResultArticle> => {
					const dom = await downloadPage(itemPageLink);
					const description = getDescription(dom);
					const imageURL = getThumbnail(dom);
					const additionalInfo = getAdditionalInfo(dom);
					const formattedMessage = formatMessage(
						itemName,
						imageURL,
						description,
						itemPageLink,
						additionalInfo
					);
					return {
						id: String(index),
						type: "article",
						thumb_url: imageURL,
						title: escape(itemName),
						input_message_content: {
							parse_mode: "MarkdownV2",
							message_text: formattedMessage
						}
					};
				}
			)
		);
		return answerInlineQuery(response);
	}
);

bot.catch((err: Error) => {
	const date = new Date();
	console.error(`${date.toDateString()} : ${err.message}`);
});

void bot.launch().then(() => console.info("Bot started...\n"));
