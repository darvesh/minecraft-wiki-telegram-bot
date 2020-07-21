import telegraf from "telegraf";

import { BOT_TOKEN } from "./config";
import { itemHandler } from "./handlers/items";
import { recipeHandler } from "./handlers/recipes";
import { instantiateFuse } from "./helpers/recipes";
import { startCommand, helpCommand } from "./constants";

const fuse = instantiateFuse();

const bot = new telegraf(BOT_TOKEN);

bot.on("inline_query", async context => {
	const query = context.inlineQuery?.query || "";
	if (query.startsWith("#")) await recipeHandler(context, fuse);
	else await itemHandler(context);
});

bot.command("start", context =>
	context.replyWithHTML(startCommand, { disable_web_page_preview: true })
);
bot.command("help", context => context.replyWithHTML(helpCommand));

bot.catch((err: Error) => {
	const date = new Date();
	console.error(`${date.toString()} : ${err.message}`);
});

void bot.launch().then(() => console.info("Bot started...\n"));
