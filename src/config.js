import path from "path";

const config = {
  // I/O
  TEMPLATE_FILE: "assets/template.html",
  EVENTTICKET_FILE: "assets/registration.eventTicket.test.json", // Download registration.eventTicket.json from Mongo using query: {"_id.eventCode": "NZPMC24R1", "registrationStatus": "Registered"}
  OUT_DIR: "output",

  // Replace ////key using the function output
  MAPPING: {
    filename: getFullFileName, // REQUIRED
    name: getName, // ////name -> student name
    title: getTitle,
  },

  // Process options
  BATCH_SIZE: 30,
  REPLACEMENT_PREFIX: "////", // E.g. replace "////name" in template with the candidate's name
  SHOW_BROWSER: false,

  // PDF options
  LANDSCAPE: true,
  SCALE: 1.5,
};

// OUT_DIR/yearlevel/email.pdf
function getFullFileName(eventTicket) {
  const subfolder = eventTicket.personSnapshot.yearLevel; // Group by year level
  const leafFilename = `${eventTicket._id.email}.pdf`; // Name file as <email>.pdf
  return path.join(config.OUT_DIR, subfolder, leafFilename);
}

function getName(eventTicket) {
  return eventTicket.personSnapshot.studentName;
}

function getTitle(eventTicket) {
  const titles = eventTicket.result.titles;
  const options = ["Participation", "Credit", "Merit", "Distinction"];
  return returnAmongOptions(titles, options);
}

function returnAmongOptions(list, options) {
  for (const option of options) {
    if (list.includes(option)) {
      return option;
    }
  }
  return null;
}

export default config;
