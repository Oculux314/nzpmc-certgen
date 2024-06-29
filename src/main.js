import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const TEMPLATE_FILE = "src/template.html"; // An html certificate template
const EVENTTICKET_FILE = "src/registration.eventTicket.json"; // Download this query from Mongo (eventTickets): {"_id.eventCode": "NZPMC24R1"}
const OUT_DIR = "out"; // Output directory for pdf certificates
const REPLACEMENTS = {};
const LANDSCAPE = true;
const SCALE = 1;

const template = fs.readFileSync(TEMPLATE_FILE, "utf8");
const eventTickets = JSON.parse(fs.readFileSync(EVENTTICKET_FILE, "utf8"));

async function generatePdf(html, filename, isLandscape = false, scale = 1) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({
    path: filename,
    format: "A4",
    landscape: isLandscape,
    printBackground: true,
    scale,
  });
}

fs.mkdir(OUT_DIR, { recursive: true }, (err) => {
  if (err) throw err;
});
generatePdf(template, path.join(OUT_DIR, "certificate.pdf"), LANDSCAPE, SCALE);