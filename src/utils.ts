import { escapablesText } from "./constants";

const textRegex = new RegExp(`(${escapablesText.join("|")})`, "gi");
export const escape = (text: string) => text.replace(textRegex, "\\$1");
