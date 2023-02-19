let nav_open = false;
let hamburger_menu = document.getElementById("hamburger-menu");
hamburger_menu.checked = false;

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

//Toggle chevrons
let acc = document.getElementsByClassName("accordion");

for (let i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } 
  });
}