import fs from "fs";
import puppeteer from "puppeteer";

const TEMPLATE_FILE = "src/template.html"; // An html certificate template
const EVENTTICKET_FILE = "src/registration.eventTicket.json"; // Download this query from Mongo (eventTickets): {"_id.eventCode": "NZPMC24R1"}

const template = fs.readFileSync(TEMPLATE_FILE, "utf8");
const eventTickets = JSON.parse(fs.readFileSync(EVENTTICKET_FILE, "utf8"));
console.log(eventTicket);
