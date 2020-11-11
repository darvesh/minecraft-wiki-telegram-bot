import fs from "fs";
import Fuse from "fuse.js";

import { divider } from "../constants";
import { escape } from "../utils";
import { Recipe } from "../types/recipe";

const generatePattern = (pattern: string): string =>
	`+---+---+---+
| ${pattern[0]} | ${pattern[1]} | ${pattern[2]} |
+---+---+---+
| ${pattern[3]} | ${pattern[4]} | ${pattern[5]} |
+---+---+---+
| ${pattern[6]} | ${pattern[7]} | ${pattern[8]} | 
+---+---+---+`;

const patternToString = (patterns: string[]): string => {
	if (patterns.join("").length === 9)
		return escape(generatePattern(patterns.join("")));
	const arr = patterns.reduce<string[][]>(
		(table: string[][], pattern: string, rowIndex: number) => {
			const row = [...pattern].reduce<string[]>(
				(line: string[], char: string, columnIndex: number) => {
					line[columnIndex] = char;
					return line;
				},
				[" ", " ", " "]
			);
			table[rowIndex] = row;
			return table;
		},
		[
			[" ", " ", " "],
			[" ", " ", " "],
			[" ", " ", " "]
		]
	);
	const result = arr.flat(1).join("");
	return escape(generatePattern(result));
};

type keys = { key: string; item: string[] }[];
const formatKeys = (keys: keys): string =>
	keys.reduce((message, { key, item }) => {
		message += `\`${escape(key)}: ${escape(item.join(" or "))}\`\n`;
		return message;
	}, "");

const formatIngredients = (items: { [key: string]: number }): string =>
	Object.entries(items).reduce((message, [key, value]) => {
		message += `\`${escape(key)}: ${value}\`\n`;
		return message;
	}, "");

export const instantiateFuse = () => {
	const options: Fuse.IFuseOptions<Recipe> = {
		isCaseSensitive: true,
		keys: ["name"],
		minMatchCharLength: 2,
		threshold: 0.6
	};
	const recipesRaw = fs.readFileSync(
		__dirname + "/../data/recipes.json",
		"utf-8"
	);
	const recipes: Recipe[] = JSON.parse(recipesRaw); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
	const fuseIndex = Fuse.createIndex(["name"], recipes);
	const fuse = new Fuse(recipes, options, fuseIndex);
	return fuse;
};

export const search = (fuse: Fuse<Recipe>, query = "") =>
	fuse.search(query, { limit: 5 });

export const formatMessage = (value: Recipe["value"], name: string) => {
	const message = value.map(item => {
		const { count, type } = item;
		if (type === "crafting shaped") {
			const pattern = patternToString(item.pattern);
			const keys = formatKeys(item.keys);
			return `_${type}_\ncount: ${count}\n\`\`\`\n${pattern}\n\`\`\`\n${keys}`;
		} else if (type === "smithing") {
			const { base, addition } = item;
			return `_${type}_\ncount: ${count}\n\`Base: ${base}\nAddition: ${addition}\``;
		}
		const ingredients = formatIngredients(item.ingredients);
		return `_${type}_\ncount: ${count}\n\n${ingredients}`;
	});
	const response = `*${name.toUpperCase()}*\n${divider}\n${message.join(
		`${escape(divider)}\n`
	)}`;
	return response;
};
