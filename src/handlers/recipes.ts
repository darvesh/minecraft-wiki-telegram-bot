import { TelegrafContext } from "telegraf/typings/context";
import type Fuse from "fuse.js";

import { Recipe } from "../types/recipe";
import { search, formatMessage } from "../helpers/recipes";

export const recipeHandler = async (
	context: TelegrafContext,
	fuse: Fuse<Recipe, Fuse.IFuseOptions<Recipe>>
): Promise<boolean> => {
	const searchResult = search(fuse, context.inlineQuery?.query.slice(1, -1));
	const results = searchResult.map((result, index) => {
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
	return await context.answerInlineQuery(results);
};
