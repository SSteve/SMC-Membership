// These methods assume that the code is filling labels with three fields:
// FirstName, LastName, and VoicePartName
// The code is looking for three fields to replace:
// {FN}, {LN}, {Section}

function createNameBadges() {
    createLabels_("Name Badges", "1619jbN0ivbN5MzkvdXeY0mrapLIh4FDwYB-DTzklG6Y");
    //createLabels_("Name Badges", "1d5SQm90uuAZ8xJlPj4oMsZU2ouwAVF0P");
}

function createDuesLabels() {
  createLabels_("Dues Labels", "1oZVh4qhF-aXOy9rTOZPJEiPDP7IOm83stj82u4ITlJ4");
}

function createLabels_(titleBase, docTemplateId)
{
  // ID for the Membership folder.
  var folderId = "1ZIgR2xYVvxIWzoP7u9c7SJYAn5UKNgCx";

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName("Active Singers");

  var cycle = getCurrentCycleName();

  // Retrieve all of the data. 3 columns.
  var data = ws.getRange(2, 1, ws.getLastRow() - 1, 3).getValues();

  var docTitle = `${titleBase}.${cycle}`;

  // Get the folder reference
  var folder = DriveApp.getFolderById(folderId)

  // Get reference to template file, and make a copy in the 
  // output folder.
  var templateFile = DriveApp.getFileById(docTemplateId);
  var outputFile = templateFile.makeCopy(docTitle, folder);

  // Open the output file.
  var docFinal = DocumentApp.openById(outputFile.getId());
  var body = docFinal.getBody();

  data.forEach(singer => {
    const templates = [["{FN}", singer[0]], ["{LN}", singer[1]], ["{Section}", singer[2]]];    
    replaceData_(body, templates);
  })
}

function replaceData_(body, templates) {
  templates.forEach(template => {
    replaceFirst_(body, template[0], template[1]);
  })
}

function replaceFirst_(body, old, replacement) {
  var found = body.findText(old);
  if (found) {
    var start = found.getStartOffset();
    var end = found.getEndOffsetInclusive();
    var text = found.getElement().asText();
    text.deleteText(start, end);
    text.insertText(start, replacement);
  }
}