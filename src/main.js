import config from "./config.js";
import { eventTickets, template } from "./input.js";
import { logPreprocessing, logProgress, logStart, logSummary } from "./log.js";
import { getStaticMapping, populateTemplate } from "./processing.js";
import { generatePdf } from "./puppeteer.js";
const { BATCH_SIZE, MAPPING } = config;

logStart();

// Event ticket + function mapping -> static mapping
const mappings = eventTickets.map((eventTicket) =>
  getStaticMapping(eventTicket, MAPPING),
);

// Template + static mapping -> { HTML + filename }
const personalisedCertificates = mappings.map((mapping) =>
  populateTemplate(template, mapping),
);

logPreprocessing();

// { HTML + filename } -> PDF
for (let i = 0; i < eventTickets.length; i += BATCH_SIZE) {
  const batch = personalisedCertificates.slice(i, i + BATCH_SIZE);
  await Promise.all(
    batch.map(({ html, filename }) => generatePdf(html, filename)),
  );
  logProgress();
}

logSummary();
