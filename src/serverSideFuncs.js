function getWorksheet_(wsName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(wsName);
}

function sortSingers() {
  const ws = getWorksheet_("Singers");
  const data = ws.getRange(2, 1, ws.getLastRow() - 1, ws.getLastColumn());
  const sortOrder = [
    {column: 7, ascending: true}, 
    {column: 6, ascending: true},
    {column: 3, ascending: true},
    {column: 2, ascending: true}
    ];
  data.sort(sortOrder);
}

function getDataForSearch() {
  const ws = getWorksheet_("Singers");
  const results = ws.getRange(2, 1, ws.getLastRow() - 1, 14).getValues();

  // Remove the blank rows, caused by the check box validation in the COVID field.
  return results.filter((row) => row[0] !== "");
}

function testDeleteById() {
  deleteById("154", "homer@getz.com");
}

function findSingerEmailInfo(email) {
  // Given a singer email, find the corresponding row in the EmailList worksheet.
    const wsEmailList = getWorksheet_("EmailList");
    const data = wsEmailList.getRange(2, 2, wsEmailList.getLastRow() - 1, 2).getValues();
    const singerRow = data.filter((r) => r[0].toString() === email);
    return singerRow;
}

function deleteById(id, email) {
  const ws = getWorksheet_("Singers");
  // Get array of singer IDs and convert to single-dimensional array
  const singerIds = ws
    .getRange(2, 1, ws.getLastRow() - 1, 1)
    .getValues()
    .map((r) => r[0].toString());

  var row = singerIds.indexOf(id);

  // Only proceed if the id was found.
  if (row !== -1) {
    // In addition to deleting the user from the Singers worksheet, 
    // we also need to delete the email address from the 
    // google groups. To do that, we need the singer's email address
    // and voice part. Easiest: Once we have the email address, 
    // look up the corresponding voice part email in the EmailList
    // worksheet. Use these two things to delete from the email groups
    // (the delete method there requires both values.)

    const singerRow = findSingerEmailInfo(email);
    if (singerRow.length > 0) {
      // We found a match in the EmailList sheet.
      deleteGroupMember(singerRow[0][0], singerRow[0][1]);
    }

    // row is off by 2: 1 for headers, 1 for conversion from 0 to 1-based.
    ws.deleteRow(row + 2);

  }
}

function saveChangesById(singerData) {
  const ws = getWorksheet_("Singers");
  const singerIds = ws.getRange(2, 1, ws.getLastRow() - 1, 1).getValues();
  let rowNumber = singerIds.findIndex((r) => r[0] === singerData[0]);
  if (rowNumber === -1) {
    return false;
  }
  // We found a match for the singer ID, so we can go on.
  // The number is off by 2: One because Javascript is 0-based,
  // and one because of the column header.
  rowNumber += 2;
  replaceCells_(ws, rowNumber, singerData);
  return true;
}

function replaceCells_(ws, rowNumber, singerData) {
  // singerData contains an array of fields in the correct order to update the
  // spreadsheet. God help us if anyone changes the order of the fields in the
  // spreadsheet!

  // Field name, array index
  // ID, 0
  // FirstName, 1
  // LastName, 2
  // Full Name, 3
  // VoicePart, 4
  // Voice Part Value, 5
  // Active, 6
  // StreetAddress, 7
  // City, 8
  // State, 9
  // ZipCode, 10
  // Email, 11
  // Home, 12
  // Mobile, 13

  // Use setValues to set values of columns 1,2, then 4, then 6-14
  ws.getRange(rowNumber, 2, 1, 2).setValues([[singerData[1], singerData[2]]]);
  ws.getRange(rowNumber, 5, 1, 1).setValue([singerData[4]]);
  ws.getRange(rowNumber, 7, 1, 8).setValues([[...singerData.slice(6, 14)]]);
}

function getMaxId_(ws) {
  const singerIds = ws.getRange(2, 1, ws.getLastRow() - 1, 1).getValues();
  // Find the current maximum singer ID.
  let maxId = 0;
  singerIds.forEach(function (r) {
    maxId = r[0] > maxId ? r[0] : maxId;
  });
  // Increase the max ID for the new singer.
  return maxId + 1;
}

function addNewSinger(singerData) {
  const ws = getWorksheet_("Singers");
  const newId = getMaxId_(ws);

  // Copy the final row, and then overwrite the data, maintaining the formulas.
  let rowNumber = ws.getLastRow();
  const rangeToCopy = ws.getRange(rowNumber, 2, 1, 14);
  ws.appendRow([newId]);
  // Bump up to the new row.
  rowNumber++;
  rangeToCopy.copyTo(ws.getRange(rowNumber, 2));
  replaceCells_(ws, rowNumber, singerData);
  
  // Now add the new singer to the Google Groups email list.
  const singerRow = findSingerEmailInfo(singerData[11]);
  Logger.log(singerRow);
  if (singerRow.length > 0) {
    addGroupMember(singerRow[0][0], singerRow[0][1]);
  }

  return true;
}

function calcMonths(season) {
  const months = {};
  if (season === "Fall") {
    months.start = 9;
    months.end = 12;
  } else if (season === "Spring") {
    months.start = 2;
    months.end = 5;
  }
  return months;
}

function deleteEvents(cal, startDate, endDate) {
  // Delete calendar events from a calendar in a given date range.
  const events = cal.getEvents(startDate, endDate);
  events.forEach((event) => {
    event.deleteEvent();
  });
}

const cols = {
  date: 0,
  title: 5,
  startTime: 8,
  endTime: 9,
  location: 6,
  eventType: 7,
};

// These currently refer to "test" calendars
const SMCRegularID = "sierramasterchorale.org_tee4cp5fcta6lutd56194p89ac@group.calendar.google.com";
const SMCRequiredID = "sierramasterchorale.org_jm1sc8ncp6d65o96ml04j328h4@group.calendar.google.com";
const SMCOptionalID = "sierramasterchorale.org_e2rmhi22cbsgnq063270n7fhog@group.calendar.google.com";

function testCreateCalendarEvents() {
  const results = createCalendarEvents("Regular", {
    season: "Fall",
    year: 2021,
  });
  Logger.log(results);
}

function testCreateImportantDates() {
  const cycle = { season: "Fall", year: 2021 };

  months = calcMonths(cycle.season);
  const filteredEvents = getEventsFromSpreadsheet(cycle);
  Logger.log(filteredEvents);
  createImportantDates(filteredEvents, true);
}

let months;

function getEventsFromSpreadsheet(cycle) {
  // Retrieve cycle date information from the spreadsheet.
  const ws = getWorksheet_("CycleDates");
  const dates = ws.getRange(2, 1, ws.getLastRow() - 1, 10).getValues();

  // Filter the data from the spreadsheet to be only for the requested cycle.
  return dates.filter((row) => {
    const date = new Date(row[cols.date]);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return year === cycle.year && month >= months.start && month <= months.end;
  });
}

function createCalendarEvents(calName, cycle) {
  if (!cycle) return null;

  calName = calName.toLowerCase();
  let calID;
  switch (calName) {
    case "regular":
      calID = SMCRegularID;
      break;
    case "optional":
      calID = SMCOptionalID;
      break;
    case "required":
      calID = SMCRequiredID;
      break;
    default:
      return null;
  }

  const cal = CalendarApp.getCalendarById(calID);
  if (cal == null) {
    //user may not have access, auto-subscribe them.
    cal = CalendarApp.subscribeToCalendar(calID);
  }
  // Still null? Time to give up.
  if (cal == null) {
    throw "Unable to retrieve calendar.";
  }

  months = calcMonths(cycle.season);
  const filteredEvents = getEventsFromSpreadsheet(cycle);

  // filteredEvents contains all the rows that match the year and cycle months.
  // Now go delete all existing dates from the requested calendar for the cycle.
  // This allows you to update the dates; note that this code clears the calendar before
  // adding new calendar entries.

  // // Separate out the regular, optional, and required events.
  // const events = filteredEvents.filter((event) => {
  //   return event[cols.eventType].toLowerCase() === calName;
  // });

  // Calculate the start and end dates for removing events.
  const startDate = new Date(cycle.year, months.start - 1, 1, 0, 0);
  const endDate = new Date(cycle.year, months.end - 1, 31, 11, 59);

  // Delete all existing events from the various calendars.
  deleteEvents(cal, startDate, endDate);

  // Now, create the events for each calendar.
  filteredEvents.forEach((event) => {
    const startTime = event[cols.startTime];
    const endTime = event[cols.endTime];
    const title = event[cols.title];
    const location = event[cols.location];
    const calName =  event[cols.eventType].toLowerCase();
    let eventColor;
    switch (calName) {
      case "regular":
        eventColor = "10";  // Green
        break;
      case "required":
        eventColor = "11"; // Red
        break;
      case "optional":
        eventColor = "5";  // Yellow
        break;
      default:
        eventColor = "11"; // Red
        break;
    }
    const newEvent = cal.createEvent(title, startTime, endTime, {
      location: location,
    });
    newEvent.setColor(eventColor);

  });
  createImportantDates(filteredEvents);
  return filteredEvents.length;
}

// function createCalendarEvents(calName, cycle) {
//   if (!cycle) return null;

//   calName = calName.toLowerCase();
//   let calID;
//   switch (calName) {
//     case "regular":
//       calID = SMCRegularID;
//       break;
//     case "optional":
//       calID = SMCOptionalID;
//       break;
//     case "required":
//       calID = SMCRequiredID;
//       break;
//     default:
//       return null;
//   }

//   const cal = CalendarApp.getCalendarById(calID);
//   if (cal == null) {
//     //user may not have access, auto-subscribe them.
//     cal = CalendarApp.subscribeToCalendar(calID);
//   }
//   // Still null? Time to give up.
//   if (cal == null) {
//     throw "Unable to retrieve calendar.";
//   }

//   months = calcMonths(cycle.season);
//   const filteredEvents = getEventsFromSpreadsheet(cycle);

//   // filteredEvents contains all the rows that match the year and cycle months.
//   // Now go delete all existing dates from the requested calendar for the cycle.
//   // This allows you to update the dates; note that this code clears the calendar before
//   // adding new calendar entries.

//   // Separate out the regular, optional, and required events.
//   const events = filteredEvents.filter((event) => {
//     return event[cols.eventType].toLowerCase() === calName;
//   });

//   // Calculate the start and end dates for removing events.
//   const startDate = new Date(cycle.year, months.start - 1, 1, 0, 0);
//   const endDate = new Date(cycle.year, months.end - 1, 31, 11, 59);

//   // Delete all existing events from the various calendars.
//   deleteEvents(cal, startDate, endDate);

//   // Now, create the events for each calendar.
//   events.forEach((event) => {
//     const startTime = event[cols.startTime];
//     const endTime = event[cols.endTime];
//     const title = event[cols.title];
//     const location = event[cols.location];

//     cal.createEvent(title, startTime, endTime, {
//       location: location,
//     });
//   });
//   createImportantDates(filteredEvents);
//   return events.length;
// }

function createImportantDates(filteredEvents, includeRegular=true) {
  // Filter data skip all "regular rehearsal" dates
  // (Column 5 != "Regular")

  let importantDates = filteredEvents;

  if(!includeRegular) {
    importantDates = filteredEvents.filter((row) => {
      return row[4] != "Regular";
    });
  }

  // Walk through all the rows
  // Copy date to column 1.
  const ws = getWorksheet_("ImportantDates");
  ws.getRange(2, 1, 30, 2).clearContent();
  if (importantDates.length === 0) {
    return;
  }
  ws.getRange(1, 1).setValue(importantDates[0][0].getFullYear());

  // Analyze start time and end time:
  //  If both are PM, just use PM on end time (6 to 9PM)
  //  If start is AM and end is PM, include both (10AM to 4PM)
  // in column 2, put time span, semi-colon, then description
  importantDates.forEach((event, index) => {
    const eventDate = event[0];
    let startTime = event[2];
    const endTime = event[3];
    const description = event[5];
    const startAMPM = startTime.slice(-2);
    const endAMPM = endTime.slice(-2);
    // If they're both AM or PM, delete the starting AMPM value.
    // It will just appear on the end time, in that case.
    if (startAMPM == endAMPM) {
      startTime = startTime.slice(0, -2);
    }
    const eventDescription = startTime + " to " + endTime + "; " + description;

    // Insert the two values into the two columns.
    ws.getRange(index + 2, 1, 1, 2).setValues([[eventDate, eventDescription]]);
  });
}
