function test_myselect() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Singers");
  let headerRange = sheet.getRange("A1:N1");
  Logger.log(headerRange.getColumn[0]);

  //MYSELECT(text, headerRange);
  let text = MYSELECT("SELECT [FirstName], [LastName], [VoicePart], [StreetAddress], [City], [State], [ZipCode], [Email], [Home], [Mobile] WHERE [Active] Contains 'Active' or [Active] contains 'Rehearsal Only' ORDER BY [Voice Part Value], [LastName], [FirstName]", headerRange);
  Logger.log(text);
}

/**
 * Allows for [bracketed field names] in QUERY string. Replaces with col#
 *
 * @param {string} SQL string
 * @param {Range} Header Range
 * @returns The modified QUERY string
 * @customfunction
 */
function MYSELECT(sqlstring, headerRange) {
  let text = sqlstring;
  
  let headers = headerRange[0];

  let results = text.matchAll(/\[.*?\]/g);
  let matches = [...results].map(match => match[0]);
  let uniqueMatches = [...new Set(matches)];

  uniqueMatches.forEach(match => {
    let colName = match.slice(1, -1);
    let pos = headers.indexOf(colName);
    if (pos != -1) {
      // Found a match.
      text = text.replace(new RegExp(`\\[${colName}\\]`, "g"), `Col${pos + 1}`);
    }
  })
  return text;
}
