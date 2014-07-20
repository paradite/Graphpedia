function toggle1() {
    var ele = document.getElementById('subdiv1');
    var text = document.getElementById('toggletext1');
    var titlebox = document.getElementById('togglebox1');
    if(ele.style.display == "block") {
        ele.style.display = "none";
        text.innerHTML = "Show";
        titlebox.style.cursor= "zoom-in";
    }
    else {
        ele.style.display = "block";
        text.innerHTML = "Hide";
        window.location.hash = "subdiv1";
        titlebox.style.cursor= "zoom-out";
    }
}

function toggle2() {
    var ele = document.getElementById('subdiv2');
    var text = document.getElementById('toggletext2');
    var titlebox = document.getElementById('togglebox2');
    if(ele.style.display == "block") {
        ele.style.display = "none";
        text.innerHTML = "Show";
        titlebox.style.cursor= "zoom-in";
    }
    else {
        ele.style.display = "block";
        text.innerHTML = "Hide";
        window.location.hash = "subdiv2";
        titlebox.style.cursor= "zoom-out";
    }
}

function toggle3() {
    var ele = document.getElementById('subdiv3');
    var text = document.getElementById('toggletext3');
    var titlebox = document.getElementById('togglebox3');
    if(ele.style.display == "block") {
        ele.style.display = "none";
        text.innerHTML = "Show";
        titlebox.style.cursor= "zoom-in";
    }
    else {
        ele.style.display = "block";
        text.innerHTML = "Hide";
        window.location.hash = "subdiv3";
        titlebox.style.cursor= "zoom-out";    
    }
}