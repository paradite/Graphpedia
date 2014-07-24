$(document).ready(function(){
    $("#closeButton").click(function(){
        $("#askBox").fadeOut(1000);
    });
    $("#add").click(function () {
        if ($('#e1').select2("val") != ''){
            alert("Thanks for your contribution!");
            window.location.replace('/');
        }
    });
});