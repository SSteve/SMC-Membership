const docTitleBase = "CoverPages";

function getImportantDates() {
  const ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("ImportantDates");
  const rng = ss.getRange(2, 1, ss.getLastRow() - 1, 2);
  const values = rng.getValues();
  var output = "";
  values.forEach(value => {
    var formattedDate = Utilities.formatDate(value[0], "GMT", "E, MMM d");
    output += formattedDate + ": " + value[1] + '\n';
  }
  )
  Logger.log(output);
  return output;
}

function createCoverPages() {
  var docTemplateId = "1lotsbSj6VHPV3Z1mW0DY5NegWxe5eIeGWzjExDqBUD4";

  // ID for the Membership folder.
  var folderId = "1Rqe-VJ3_d0YhJawZ_3oZuD6xsOm7aNlB";

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ws = ss.getSheetByName("Active Singers");

  var cycle = getCurrentCycleName();

  // Retrieve all of the data. 14 columns.
  var data = ws.getRange(2, 1, ws.getLastRow() - 1, 14).getValues();

  var docTemplate = DocumentApp.openById(docTemplateId);
  // Create a title like "Cover Pages.Spring 2024"
  var docTitle = `${docTitleBase}.${cycle}`;
  var outputId = createNewDocInFolder(folderId, docTitle);
  var docFinal = DocumentApp.openById(outputId);

  var templateParagraphs = docTemplate.getBody().getParagraphs();
  var body = docFinal.getBody();
  body.setMarginTop(10);
  body.setMarginBottom(10);
  body.clear();

  const importantDates = getImportantDates();

  data.forEach(singer => {
    createMerge_(singer, cycle, templateParagraphs, docFinal, importantDates);
  })
}


function createMerge_(singer, cycle, templateParagraphs, docFinal, importantDates) {
  var body = docFinal.getBody();

  templateParagraphs.forEach(function (p) {
    body.appendParagraph(p.copy()
      .replaceText("{cycle}", cycle)
      .replaceText("{importantDates}", importantDates)
      .replaceText("{first}", singer[0])
      .replaceText("{last}", singer[1])
      .replaceText("{section}", singer[2])
      .replaceText("{slName}", singer[10])
      .replaceText("{slEmail}", singer[11])
      .replaceText("{slPhone}", normalize_(singer[13].toString()))
    )
  });
  docFinal.appendPageBreak();
}

function normalize_(phone) {
  //normalize string and remove all unnecessary characters
  if (phone.length > 0) {
    const newphone = phone.replace(/[^\d]/g, "");

    //check if number length equals to 10
    if (newphone.length == 10) {
      //reformat and return phone number
      return newphone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
  }
  return "";
}
