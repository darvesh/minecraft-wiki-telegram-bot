import type Fuse from "fuse.js";
import { Context } from "grammy";

import { Recipe } from "../types/recipe";
import { search, formatMessage } from "../helpers/recipes";
import { InlineQueryResult } from "grammy/out/platform.node";

export const recipeHandler = async (
	context: Context,
	fuse: Fuse<Recipe>
): Promise<boolean> => {
	const searchResult = search(fuse, context.inlineQuery?.query.slice(1, -1));
	const results: InlineQueryResult[] = searchResult.map((result, index) => {
		const formattedMessage = formatMessage(
			result.item.value,
			result.item.name
		);
		return {
			id: String(index),
			type: "article",
			title: result.item.name,
			input_message_content: {
				parse_mode: "MarkdownV2",
				message_text: formattedMessage
			}
		};
	});
	return context.answerInlineQuery(results);
};
