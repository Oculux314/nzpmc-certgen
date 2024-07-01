import fs from "fs";
import config from "./config.js";
const { TEMPLATE_FILE, EVENTTICKET_FILE } = config;

const readFile = (filename) => fs.readFileSync(filename, "utf8");

export const template = readFile(TEMPLATE_FILE); // String
export const eventTickets = JSON.parse(readFile(EVENTTICKET_FILE)); // JSON
