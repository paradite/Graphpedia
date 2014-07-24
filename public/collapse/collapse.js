$(document).ready(function() { 
    $('#togglebox1').click(function () {
        if ($('#subdiv1').css('display') != 'block') {
            $('#subdiv1').slideDown("slow");
            $('#toggletext1').text("Show");
            $('#togglebox1').css('cursor', 'zoom-in');
            $('html, body').animate({
                scrollTop: $("#togglebox1").offset().top
            }, 2000);
        } else{
            $('#subdiv1').slideUp("slow");
            $('#toggletext1').text("Hide");
            $('#togglebox1').css('cursor', 'zoom-out');
        };
    })

    $('#togglebox2').click(function () {
        if ($('#subdiv2').css('display') != 'block') {
            $('#subdiv2').slideDown("slow");
            $('#toggletext2').text("Show");
            $('#togglebox2').css('cursor', 'zoom-in');
            $('html, body').animate({
                scrollTop: $("#togglebox2").offset().top
            }, 2000)
        } else{
            $('#subdiv2').slideUp("slow");
            $('#toggletext2').text("Hide");
            $('#togglebox2').css('cursor', 'zoom-out');
        };
    })

    $('#togglebox3').click(function () {
        if ($('#subdiv3').css('display') != 'block') {
            $('#subdiv3').slideDown("slow");
            $('#toggletext3').text("Show");
            $('#togglebox3').css('cursor', 'zoom-in');
            $('html, body').animate({
                scrollTop: $("#togglebox3").offset().top
            }, 2000)
        } else{
            $('#subdiv3').slideUp("slow");
            $('#toggletext3').text("Hide");
            $('#togglebox3').css('cursor', 'zoom-out');
        };
    })
});