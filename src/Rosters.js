function createRosters() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cycle = getCurrentCycleName();
  const sheet = ss.getSheetByName("Roster");
  const singers = getSingers_();

  // singers consists of all these columns:
  // 0: ID
  // 1: FirstName
  // 2: LastName
  // 3: Full Name
  // 4: Voice Part

  // GetValues method returns a two-dimensional array. Use the map method to
  // retrieve the 0th element from each row.
  var rostersToPrint = ss.getRangeByName("RostersToPrint").getValues().map(r => { return r[0] });
  Logger.log(rostersToPrint);

  rostersToPrint.forEach((section) => {
    var sectionList;
    Logger.log("Creating roster: " + section);
    // Delete the previous roster sheet, if it exists
    try {
      var sheetToDelete = ss.getSheetByName(section);
      ss.deleteSheet(sheetToDelete);
    }
    catch (err) {
      Logger.log("Unable to delete sheet: " + section)
    }

    sheet.getRange("B1:AA1").setValue("SMC " + cycle + " " + section);
    switch (section) {
      // We handle Tenor/Bass differently:
      // Tenor I and Tenor II have one section leader/roster
      // Same for Bass/Baritone
      case "Tenor":
      case "Bass":
        const toMatch = section.substring(0, 2);
        sectionList = singers.filter(singerData => {
          return singerData[4].substring(0, 2) === toMatch &&
            singerData[6].substring(0, 6) === "Active";
        });
        break;
      // All others...
      default:
        sectionList = singers.filter(singerData => {
          // Filter to just singers in the appropriate section.
          return singerData[4] === section &&
            singerData[6].substring(0, 6) === "Active";
        });
    }
    sectionList.sort(compareNames_);
    const sectionNames = sectionList.map(singerData => {
      return [singerData[3]];
    });
    createSectionRoster_(sectionNames, sheet);
    const newSheet = sheet.copyTo(ss);
    newSheet.setName(section);
  })
  saveAllToPDFAndDelete_(rostersToPrint);
}

function saveAllToPDFAndDelete_(rostersToPrint) {
  // I couldn't get the grid lines to print if I saved to PDF immediately
  // after creating each sheet. So let's save each to new sheet and delete

  rostersToPrint.forEach(section => {
    Logger.log("Saving PDF: " + section);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(section);
    const cycle = getCurrentCycleName();
    const sheetID = sheet.getSheetId();
    SaveSheetAsPDF(sheetID, "Membership", `Roster.${cycle}.${section}.pdf`);
    try {
      var sheetToDelete = ss.getSheetByName(section);
      ss.deleteSheet(sheetToDelete);
      Logger.log("Deleting: " + section);
    }
    catch (err) {
      Logger.log("Unable to delete sheet (Not an error): " + section);
    }
  });
}

function compareNames_(a, b) {
  var firstNameA = a[1].toUpperCase(); // ignore upper and lowercase
  var firstNameB = b[1].toUpperCase();
  var lastNameA = a[2].toUpperCase();
  var lastNameB = b[2].toUpperCase();

  if (lastNameA < lastNameB) {
    return -1;
  }
  else if (lastNameA > lastNameB) {
    return 1;
  }
  // last names match, so compare first names.
  else if (firstNameA < firstNameB) {
    return -1;
  }
  else if (firstNameA > firstNameB) {
    return 1;
  }
  else {
    return 0;
  }
}

function getSingers_() {
  const singerSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Singers");
  const lastRow = singerSheet.getDataRange().getLastRow();
  // Start at cell A2, and retrieve 6 columns for all the rows.
  return singerSheet.getRange(2, 1, lastRow - 1, 7).getValues();
}

function createSectionRoster_(sectionNames, sheet) {
  // Create roster sheet for a single section.
  // Soprano I, Soprano II, Alto I, Alto II, Tenor, Bass

  // Clean up from the previous roster.
  manageDataAndBorders_(sheet, clearIt = true);

  // In this sheet, the data starts at A4.
  const nameRange = sheet.getRange(4, 1, sectionNames.length, 1);
  nameRange.setValues(sectionNames);

  manageDataAndBorders_(sheet, clearIt = false);
  sheet.autoResizeColumn(1);
}


function manageDataAndBorders_(sheet, clearIt) {
  // Deal with borders and content. If clearIt is true,
  // clear out the content and remove the borders.
  // If clearIt is false, just turn on borders.

  let dataRange = sheet.getDataRange();
  let lastCol = dataRange.getLastColumn();
  let lastRow = dataRange.getLastRow();

  // Is there data already in the sheet? If so, clear it out,
  // and remove the grid lines. Otherwise, set the borders to appear.

  if (lastRow >= 4 && lastCol > 1) {
    var gridRange = sheet.getRange(4, 1, lastRow - 3, lastCol);
    if (clearIt) {
      gridRange.clearContent();
      gridRange.setBorder(false, false, false, false, false, false);
    }
    else {
      gridRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);
    }
  }
}