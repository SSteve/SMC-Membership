function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SMC Prep')
    .addItem('Re-Sort Singers Worksheet', 'sortSingers')
    .addItem('Add/Edit Singers', 'loadSingerForm')
    .addItem('Create calendar items', 'loadCycleSelector')
    .addItem('Create email groups', 'fillGroups')
    .addItem('Create cover pages', 'createCoverPages')
    .addItem('Create name badges', 'createNameBadges')
    .addItem('Create rosters', 'createRosters')
    .addItem('Create dues labels', 'createDuesLabels')
    .addItem('Print dues list', 'printDuesList')
    .addToUi();
}

function fillGroupsWithUI() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile("addSinger");

  // var htmlOutput = HtmlService
  //   .createHtmlOutput('<p>A change of speed, a change of style...</p>')
  //   .setWidth(250)
  //   .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'My add-on');
  

  fillGroups();
}

function getCurrentCycleName() {
  return getGlobalInfo("CurrentCycle");
}

function getCurrentCycle() {
  // Return a cycle object ({season, year})
  return { season: getGlobalInfo("CurrentSeason"), year: getGlobalInfo("CurrentYear") };
}

function setCurrentCycle(cycle) {
  setGlobalInfo("Cycle", cycle);
}

function setGlobalInfo(item, value) {
  // Set info based on a named range.

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  switch (item) {
    case "CurrentSeason":
    case "CurrentYear":
      ss.getRangeByName(item).setValue(value);
      break;
    case "Cycle":
      ss.getRangeByName("CurrentSeason").setValue(value.season);
      ss.getRangeByName("CurrentYear").setValue(value.year);
  }
}

function getGlobalInfo(item) {
  // Return info based on a named range.

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  switch (item) {
    case "CurrentCycle":
    case "CurrentSeason":
    case "CurrentYear":
      var data = ss.getRangeByName(item).getValue();
      break;
  }
  return data;
}

function createNewDocInFolder(folderId, docName) {
  // Create doc in root directory and get its ID.
  const doc = DocumentApp.create(docName);
  const docId = doc.getId();

  // Find the correct folder. 
  const folder = DriveApp.getFolderById(folderId);
  var originalDocFile = DriveApp.getFileById(docId);

  // Copy the file to the new folder, and remove it from
  // the root folder. Also, if the output file exists, 
  // delete it first.
  // try {
  //   folder.removeFile(folder.getFilesByName(docName).next());
  // }
  // catch (err) {
  //   Logger.log("No file to delete.");
  // }
  var docFile = folder.addFile(originalDocFile);
  //DriveApp.getRootFolder().removeFile(originalDocFile);

  // Return the document ID so the caller can use it.
  return (docId);

}
