/**
 * Call this script with: npm run convert <imagePath>
 * E.g. npm run convert assets/blue.svg
 *
 * It reads the image file and prints the base64 representation to the console to use in the html
 * since you can't use images directly in puppeteer.
 */

import fs from "fs";

const imageUrl = process.argv[2];
const base64Image = fs.readFileSync(`${imageUrl}`).toString("base64");
console.log(base64Image);
