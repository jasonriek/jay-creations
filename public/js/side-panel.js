let nav_open = false;
let hamburger_menu = document.getElementById("hamburger-menu");

function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}

function openNav() {
    nav_open = !nav_open;
    if(nav_open)
        document.getElementById("mySidepanel").style.width = "275px";
    else
        closeNav();
}
  
hamburger_menu.onclick = function() {
    openNav();
}