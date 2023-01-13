let editor = document.getElementById('description_editor'); 

editor.addEventListener('input', function() {
    let node_name = environment.selected_node_name;
    let node_type = environment.selected_node_type;
    environment.nodes[node_type][node_name].setDescription(this.value);
});

editor.addEventListener('focusout', function() {
    environment.draw();
});

node_title.addEventListener('focusout', function() {
    environment.renameNode(this);
});






