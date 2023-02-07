function testSaveSheetAsPDF() {
  SaveSheetAsPDF("1660484852", "Membership", "Roster.Spring 2022.Tenor.pdf");
}

function SaveSheetAsPDF(worksheetID, folderName, fileName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetID = ss.getId();

  // Again, the URL to your spreadsheet but now with "/export" at the end
  // Change it to the link of your spreadsheet, but leave the "/export"
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetID}/export?`;

  const exportOptions =
    'exportFormat=pdf' +
    '&format=pdf' + // export as pdf
    '&size=letter' + // paper size letter / You can use A4 or legal
    '&portrait=false' + // orientation portal, use false for landscape
    '&fitw=true' + // fit to page width false, to get the actual size
    '&sheetnames=false' +
    '&printtitle=false' + // hide optional headers and footers
    '&pagenumbers=false' +
    '&gridlines=false' + // hide page numbers and gridlines
    '&fzr=true' + // do not repeat row headers (frozen rows) on each page
    '&gid=' + worksheetID;

  var params = { method: "GET", headers: { "authorization": "Bearer " + ScriptApp.getOAuthToken() } };

  // Generate the PDF file
  var response = UrlFetchApp.fetch(url + exportOptions, params).getBlob();

  // // Send the PDF file as an attachement 
  //   GmailApp.sendEmail(email, subject, body, {
  //     htmlBody: body,
  //     attachments: [{
  //           fileName: "Invoice" + ".pdf",
  //           content: response.getBytes(),
  //           mimeType: "application/pdf"
  //       }]
  //   });

  // Save the PDF to Drive, and move it to the correct folder.
  const file = DriveApp.createFile(response.setName(fileName));
  file.moveTo(getFolderByName_(folderName));
}

function getFolderByName_(name) {
  // Return the first folder matching the given name.
  var folders = DriveApp.getFoldersByName(name);
  while (folders.hasNext()) {
    return folders.next();
  }
}