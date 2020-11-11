export interface Recipe {
	name: string;
	value: {
		count: number;
		pattern: string[];
		keys: {
			key: string;
			item: string[];
		}[];
		type: string;
		ingredients: {
			[key: string]: number;
		};
		group: string;
		base: string;
		addition: string;
	}[];
}
