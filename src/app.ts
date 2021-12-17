import { Bot } from "grammy";

import { BOT_TOKEN } from "./config";
import { itemHandler } from "./handlers/items";
import { recipeHandler } from "./handlers/recipes";
import { instantiateFuse } from "./helpers/recipes";
import { startCommand, helpCommand } from "./constants";

const fuse = instantiateFuse();

const bot = new Bot(BOT_TOKEN);

bot.on("inline_query", async ctx => {
	const query = ctx.inlineQuery?.query || "";
	if (query.startsWith("#")) await recipeHandler(ctx, fuse);
	else await itemHandler(ctx);
});

bot.command("start", ctx =>
	ctx.reply(startCommand, {
		disable_web_page_preview: true,
		parse_mode: "HTML"
	})
);
bot.command(
	"help",
	async ctx => await ctx.reply(helpCommand, { parse_mode: "HTML" })
);

bot.catch(err => {
	const date = new Date();
	console.error(`${date.toString()} : ${(err as Error).message}`);
});

bot.start({
	onStart: () => console.info("Bot started...\n"),
	drop_pending_updates: true
});
