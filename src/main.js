import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

//Options
const TEMPLATE_FILE = "src/template.html"; // An html certificate template
const EVENTTICKET_FILE = "src/registration.eventTicket.json"; // Download this query from Mongo (eventTickets): {"_id.eventCode": "NZPMC24R1"}
const OUT_DIR = "out"; // Output directory for pdf certificates
const FILENAME_FUNC = (eventTicket) => `${eventTicket._id.email}.pdf`; // Output filename for each pdf certificate
const SUBFOLDER_FUNC = (eventTicket) => eventTicket.personSnapshot.yearLevel; // Group eventTickets by student name
const REPLACEMENTS = {
  name: (eventTicket) => eventTicket.personSnapshot.studentName, // Replace "//name" in template with each student's name
};
const LANDSCAPE = true;
const SCALE = 1;

// Read files
const template = fs.readFileSync(TEMPLATE_FILE, "utf8");
const eventTickets = JSON.parse(fs.readFileSync(EVENTTICKET_FILE, "utf8"));

/* --- */

// Convert single eventTicket to pdf
async function processEventTicket(eventTicket) {
  const html = populateTemplate(eventTicket);
  await generatePdf(html, path.join(OUT_DIR, SUBFOLDER_FUNC(eventTicket), FILENAME_FUNC(eventTicket)));
}

// Populate template using an eventTicket
function populateTemplate(eventTicket) {
  let output = template;
  Object.entries(REPLACEMENTS).forEach(([key, func]) => {
    output = output.replaceAll(`//${key}`, getValueVerbose(eventTicket, func, key));
  });
  return output;
}

// Try get a value from an eventTicket, log warning & return empty string if error
function getValueVerbose(eventTicket, func, key) {
  try {
    const value = func(eventTicket);
    if (!value) throw new Error("Empty value");
    return value;
  } catch (e) {
    console.log(`Error getting ${key} value from eventTicket: ${FILENAME_FUNC(eventTicket)}`);
    return ""; // Avoid any chance of ugly "//key" in output
  }
}

// Single html string to pdf file
async function generatePdf(html, filename) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({
    path: filename,
    format: "A4",
    landscape: LANDSCAPE,
    printBackground: true,
    scale: SCALE,
  });
}

/* --- */

// Convert
const html = populateTemplate(eventTickets[0]);

// Output to pdf files
fs.mkdir(OUT_DIR, { recursive: true }, (err) => {
  if (err) throw err;
});
generatePdf(html, path.join(OUT_DIR, "certificate.pdf"), LANDSCAPE, SCALE);