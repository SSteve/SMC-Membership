function loadSingerForm() {
  loadPopup_("main", "Work with Singers", 950, 600);
}

function loadPopup_(popupName, popupTitle, popupWidth, popupHeight) {
  const htmlForForm = HtmlService.createTemplateFromFile(popupName);
  const htmlOutput = htmlForForm.evaluate();
  htmlOutput.setWidth(popupWidth).setHeight(popupHeight);
  const ui = SpreadsheetApp.getUi();
  ui.showModalDialog(htmlOutput, popupTitle);
}

function loadCycleSelector() {
  loadPopup_("cycle", "Create Calendar Items", 620, 300);
}

function loadEmailSetup() {
  // In the popup form, add code to push a reference to a text box to the
  // server-side code, so it can update.
  loadPopup_("AddEmailDialog", "Create Email", 620, 300);
}
