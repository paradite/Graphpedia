$(document).ready(function(){
    // Wiki URL
    if(document.getElementById('termname')){
        var termName = document.getElementById('termname').getAttribute('value');
        var wikiName = termName.replace(/ /g,"_").replace(/-/g, '_');
        $('#wikiurl').attr('href', 'http://en.wikipedia.org/wiki/' + wikiName);
    }
    
    // Ask Boxes
    $("#closeButton").click(function(){
        $("#askBox").fadeOut(1000);
    });

    // Form Select2
    $("#e1").select2({
        placeholder: "Choose a relationship",
        allowClear: true,
        });
    $("#e2").select2({
        placeholder: "Choose a term or start typing",
        allowClear: true,
        });
    $(".e1").select2({
    placeholder: "Relationship",
    allowClear: true,
    });

});

(function (window, document) {

    var layout   = document.getElementById('layout'),
        menu     = document.getElementById('menu'),
        menuLink = document.getElementById('menuLink');

    function toggleClass(element, className) {
        var classes = element.className.split(/\s+/),
            length = classes.length,
            i = 0;

        for(; i < length; i++) {
            if (classes[i] === className) {
                classes.splice(i, 1);
                break;
            }
        }
        // The className is not found
        if (length === classes.length) {
            classes.push(className);
        }

        element.className = classes.join(' ');
    }

    menuLink.onclick = function (e) {
        var active = 'active';

        e.preventDefault();
        toggleClass(layout, active);
        toggleClass(menu, active);
        toggleClass(menuLink, active);
    };

}(this, this.document));