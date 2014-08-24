$(document).ready(function() { 
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
