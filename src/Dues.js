function printDuesList() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('Print the Dues sheet');
  activateSheetByName_("Dues");
}

function activateSheetByName_(sheetName) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  sheet.activate();
}