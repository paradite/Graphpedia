$(document).ready(function() { 
    var cssstyle = {
    width: "100%",
/*    font-family: "sans-serif",
    font-size: "16px",*/
    color: "#132600",
/*    background-color: "#FAF9E6",*/
    border: "1px solid #ffffff",
    outline: "0",
 /*   -webkit-box-shadow: "inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(242, 238, 179, 1)",
            box-shadow: "inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(242, 238, 179, 1)",
*/    opacity: "0.64"
};
    $("#e1").select2({
        placeholder: "Relationship",
        allowClear: true,
        containerCss: cssstyle
        });
    $("#e2").select2({
        placeholder: "Term",
        allowClear: true,
        containerCss: cssstyle
        });
});
