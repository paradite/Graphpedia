$(document).ready(() => {
  const termName = document.getElementById('termname').getAttribute('value');
  const wikiName = termName.replace(/ /g, '_').replace(/-/g, '_');
  $('#wikiurl').attr('href', `http://en.wikipedia.org/wiki/${wikiName}`);
});
