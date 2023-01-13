let code_editor_open = false;

// Get the modal
let modal = document.getElementById("description-modal");

// Get the button that opens the modal
let edit_button = document.getElementById("node-button");

// Get the <span> element that closes the modal
let close_buttons = document.getElementsByClassName("close");

let node_title = document.getElementById('node-title');

// When the user clicks on <span> (x), close the modal
for(let close_button of close_buttons) {
  close_button.onclick = function() {
    modal.style.display = "none";
    save_modal.style.display = "none";
  }
}

let save_modal = document.getElementById('save-modal');
let save_modal_button = document.getElementById('save-modal-button');

save_modal_button.onclick = function() {
  save_modal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
  else if(event.target == save_modal) {
    save_modal.style.display = "none";
  }
}