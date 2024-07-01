import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import config from "./config.js";
import { logPdfCreated, logPdfFailed } from "./log.js";
const { SHOW_BROWSER, LANDSCAPE, SCALE } = config;

// Much faster to use single browser instance for generatePdf()
const browser = await puppeteer.launch({ headless: !SHOW_BROWSER });
const options = {
  format: "A4",
  landscape: LANDSCAPE,
  printBackground: true,
  scale: SCALE,
};

// May throw error if pdf creation fails
export async function generatePdf(html, filename) {
  const page = await browser.newPage();
  try {
    await page.setContent(html);
    createDirectoryFor(filename); // Ensure it exists
    await page.pdf({ path: filename, ...options });
    logPdfCreated(filename);
  } catch (error) {
    logPdfFailed(filename, error);
  } finally {
    page.close(); // Close page no matter what to avoid memory leak
  }
}

function createDirectoryFor(filename) {
  const directory = path.dirname(filename);
  fs.mkdir(directory, { recursive: true }, (err) => {
    if (err) throw err;
  });
}
