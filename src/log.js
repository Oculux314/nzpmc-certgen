import { eventTickets } from "./input.js";

// Stats
const total = eventTickets.length;
let processed = 0;
let succeeded = 0;
let failed = 0;
const errors = [];

/* - Mapping - */

export function logMappingError(key, filename, error) {
  console.log(`Error getting ${key} value from eventTicket: ${filename}`);
  errors.push(`Error populating variable ${key} for ${filename}: ${error}`);
}

/* - PDF Creation - */

export function logPdfCreated(filename) {
  succeeded++;
  processed++;
  console.log(`[${processed}/${total}] Created ${filename}`);
}

export function logPdfFailed(filename, error) {
  failed++;
  processed++;
  console.log(`[${processed}/${total}] Error creating ${filename}`);
  errors.push(`Error creating ${filename}: ${error}`);
}

/* - Lifecycle - */

export function logStart() {
  console.log(`Preprocessing ${total} eventTickets...`);
}

export function logPreprocessing() {
  console.log("Preprocessing complete. Generating PDFs...");
}

export function logProgress() {
  console.log(`>> [${processed}/${total}]`);
}

export function logSummary() {
  console.log(`Processed ${processed} eventTickets`);
  console.log(`Created ${succeeded} pdf files`);
  console.log(`Failed to create ${failed} pdf files`);
  errors.forEach(console.log);
}
