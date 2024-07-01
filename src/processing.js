import config from "./config.js";
import { logMappingError } from "./log.js";
const { REPLACEMENT_PREFIX } = config;

// Converts the object of key-mappingFunction pairs to an object of key-mappedValue pairs
// E.g. { name: (eventTicket) => eventTicket.personSnapshot.studentName } -> { name: "Hajin Kim" }
export function getStaticMapping(eventTicket, mapping) {
  const staticMap = {};

  for (const [key, mappingFunction] of Object.entries(mapping)) {
    try {
      staticMap[key] = mappingFunction(eventTicket);
      if (!staticMap[key]) throw new Error("Empty value");
    } catch (error) {
      logMappingError(key, mapping.filename(eventTicket), error);
      staticMap[key] = ""; // Avoid any chance of ugly "//key" in output
    }
  }

  return staticMap;
}

// Populate template using a mappings object
export function populateTemplate(template, mapping) {
  let html = template;
  Object.entries(mapping).forEach(([key, value]) => {
    html = html.replaceAll(`${REPLACEMENT_PREFIX}${key}`, value);
  });
  return { html, filename: mapping.filename };
}
