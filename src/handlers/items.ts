import { Context } from "grammy";
import { InlineQueryResultArticle } from "grammy/out/platform.node";

import {
	search,
	downloadPage,
	getThumbnail,
	getDescription,
	getAdditionalInfo,
	formatMessage
} from "../helpers/items";
import { escape } from "../utils";

export const itemHandler = async (context: Context): Promise<boolean> => {
	const result = await search(context.inlineQuery?.query);
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
	return context.answerInlineQuery(response);
};
