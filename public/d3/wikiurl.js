$( document ).ready(function() {
    var termName = document.getElementById('termname').getAttribute('value');
    console.log(termName);
    var wikiName = termName.replace(/ /g,"_");;
    $('#wikiurl').attr('href', 'http://en.wikipedia.org/wiki/' + wikiName);
    });