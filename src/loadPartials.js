function loadPartialHTML_(partial) {
  const htmlOutput = HtmlService.createTemplateFromFile(partial);
  return htmlOutput.evaluate().getContent();
}

function loadSearchView() {
  return loadPartialHTML_("search");
}

function loadAddSingerView() {
  return loadPartialHTML_("addSinger");
}

function loadEditSingerView() {
  return loadPartialHTML_("editSinger")
}
