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

    // Collapse toggle
    $('#togglebox1').click(function () {
        if ($('#subdiv1').css('display') != 'block') {
            $('#subdiv1').slideDown();
            $('#toggletext1').text("Hide");
            $('#togglebox1').css('cursor', 'zoom-in');
            $('html, body').animate({
                scrollTop: $("#togglebox1").offset().top
            }, 500);
        } else{
            $('#subdiv1').slideUp();
            $('#toggletext1').text("Show");
            $('#togglebox1').css('cursor', 'zoom-out');
        };
    })

    $('#togglebox2').click(function () {
        if ($('#subdiv2').css('display') != 'block') {
            $('#subdiv2').slideDown();
            $('#toggletext2').text("Hide");
            $('#togglebox2').css('cursor', 'zoom-in');
            $('html, body').animate({
                scrollTop: $("#togglebox2").offset().top
            }, 500)
        } else{
            $('#subdiv2').slideUp();
            $('#toggletext2').text("Show");
            $('#togglebox2').css('cursor', 'zoom-out');
        };
    })

    $('#togglebox3').click(function () {
        if ($('#subdiv3').css('display') != 'block') {
            $('#subdiv3').slideDown();
            $('#toggletext3').text("Hide");
            $('#togglebox3').css('cursor', 'zoom-in');
            $('html, body').animate({
                scrollTop: $("#togglebox3").offset().top
            }, 500)
        } else{
            $('#subdiv3').slideUp();
            $('#toggletext3').text("Show");
            $('#togglebox3').css('cursor', 'zoom-out');
        };
    })

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