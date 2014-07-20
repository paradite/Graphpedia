function toggle1() {
    var ele = document.getElementById('subdiv1');
    var text = document.getElementById('toggletext1');
    if(ele.style.display == "block") {
        ele.style.display = "none";
        text.innerHTML = "Show";
    }
    else {
        ele.style.display = "block";
        text.innerHTML = "Hide";
        window.location.hash = "subdiv1";
    }
}

function toggle2() {
    var ele = document.getElementById('subdiv2');
    var text = document.getElementById('toggletext2');
    if(ele.style.display == "block") {
        ele.style.display = "none";
        text.innerHTML = "Show";
    }
    else {
        ele.style.display = "block";
        text.innerHTML = "Hide";
        window.location.hash = "subdiv2";
    }
}

function toggle3() {
    var ele = document.getElementById('subdiv3');
    var text = document.getElementById('toggletext3');
    if(ele.style.display == "block") {
        ele.style.display = "none";
        text.innerHTML = "Show";
    }
    else {
        ele.style.display = "block";
        text.innerHTML = "Hide";
        window.location.hash = "subdiv3";
    }
}