$(document).ready(function() { 
    $('#togglebox1').click(function () {
        if ($('#subdiv1').css('display') != 'block') {
            $('#subdiv1').slideDown("slow");
            $('#toggletext1').text("Show");
            $('#togglebox1').css('cursor', 'zoom-in');
            console.log("Show");
        } else{
            $('#subdiv1').slideUp("slow");
            $('#toggletext1').text("Hide");
            $('#togglebox1').css('cursor', 'zoom-out');
            console.log("hide");
        };
    })

    $('#togglebox2').click(function () {
        if ($('#subdiv2').css('display') != 'block') {
            $('#subdiv2').slideDown("slow");
            $('#toggletext2').text("Show");
            $('#togglebox2').css('cursor', 'zoom-in');
            console.log("Show");
        } else{
            $('#subdiv2').slideUp("slow");
            $('#toggletext2').text("Hide");
            $('#togglebox2').css('cursor', 'zoom-out');
            console.log("hide");
        };
    })

    $('#togglebox3').click(function () {
        if ($('#subdiv3').css('display') != 'block') {
            $('#subdiv3').slideDown("slow");
            $('#toggletext3').text("Show");
            $('#togglebox3').css('cursor', 'zoom-in');
            console.log("Show");
        } else{
            $('#subdiv3').slideUp("slow");
            $('#toggletext3').text("Hide");
            $('#togglebox3').css('cursor', 'zoom-out');
            console.log("hide");
        };
    })
});