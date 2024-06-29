import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

//Options
const TEMPLATE_FILE = "src/template.html"; // An html certificate template
const EVENTTICKET_FILE = "src/registration.eventTicket.json"; // Download this query from Mongo (eventTickets): {"_id.eventCode": "NZPMC24R1", "registrationStatus": "Registered"}
const OUT_DIR = "output"; // Output directory for pdf certificates
const FILENAME_FUNC = (eventTicket) => `${eventTicket._id.email}.pdf`; // Output filename for each pdf certificate
const SUBFOLDER_FUNC = (eventTicket) => eventTicket.personSnapshot.yearLevel; // Group eventTickets by student name
const REPLACEMENTS = {
  name: (eventTicket) => eventTicket.personSnapshot.studentName, // Replace "{name}" in template with each student's name
};
const LANDSCAPE = true;
const SCALE = 1;
const BATCH_SIZE = 10; // Number of eventTickets to process at once

// Read files
const template = fs.readFileSync(TEMPLATE_FILE, "utf8");
const eventTickets = JSON.parse(fs.readFileSync(EVENTTICKET_FILE, "utf8"));

// For logging
const totalEventTickets = eventTickets.length;
let processedEventTickets = 0;
let createdPdfFiles = 0;
console.log(`Processing ${totalEventTickets} eventTickets...`);

/* --- */

// Convert single eventTicket to pdf
async function processEventTicket(eventTicket) {
  const html = populateTemplate(eventTicket);
  await generatePdf(html, getFullFilename(eventTicket));
}

// Process 10 eventTickets async
async function batchProcessEventTickets(start, batchSize = 10) {
  await Promise.all(
    eventTickets.slice(start, start + batchSize).map(processEventTicket),
  );
}

function getFullFilename(eventTicket) {
  let filename; // Hoisted for logging
  try {
    filename = FILENAME_FUNC(eventTicket);
    const subfolder = SUBFOLDER_FUNC(eventTicket);
    return path.join(OUT_DIR, subfolder, filename);
  } catch (error) {
    console.log(
      `Error getting filename for eventTicket: ${filename ?? eventTicket}`,
    );
  }
}

// Populate template using an eventTicket
function populateTemplate(eventTicket) {
  let output = template;
  Object.entries(REPLACEMENTS).forEach(([key, func]) => {
    output = output.replaceAll(
      `{${key}}`,
      getValueVerbose(eventTicket, func, key),
    );
  });
  return output;
}

// Try get a value from an eventTicket, log warning & return empty string if error
function getValueVerbose(eventTicket, func, key) {
  try {
    const value = func(eventTicket);
    if (!value) throw new Error("Empty value");
    return value;
  } catch (error) {
    console.log(
      `Error getting ${key} value from eventTicket: ${FILENAME_FUNC(eventTicket)}`,
    );
    return ""; // Avoid any chance of ugly "//key" in output
  }
}

// Single html string to pdf file
async function generatePdf(html, filename) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);

  // Ensure output directory exists
  const directory = path.dirname(filename);
  fs.mkdir(directory, { recursive: true }, (err) => {
    if (err) throw err;
  });

  try {
    await page.pdf({
      path: filename,
      format: "A4",
      landscape: LANDSCAPE,
      printBackground: true,
      scale: SCALE,
    });
    logPdfEndStatus(`Created: ${filename}`);
    createdPdfFiles++;
  } catch (error) {
    logPdfEndStatus(`Error creating: ${filename}`);
  } finally {
    browser.close();
  }
}

function logPdfEndStatus(message) {
  processedEventTickets++;
  console.log(`[${processedEventTickets}/${totalEventTickets}] ${message}`);
}

/* --- */

for (let i = 0; i < eventTickets.length; i += BATCH_SIZE) {
  await batchProcessEventTickets(i, BATCH_SIZE);
  console.log(`>> [${processedEventTickets}/${totalEventTickets}]`);
}

console.log(`Processed ${processedEventTickets} eventTickets`);
console.log(`Created ${createdPdfFiles} pdf files`);