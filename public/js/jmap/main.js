const environment = new Environment();
const file_input = document.getElementById('file_input');
let json = {};

// Connect mouse listener to canvas for mouse clicks
environment.canvas.addEventListener('mousedown', function(e){
    //console.log(`(${e.clientX}, ${e.clientY})`)
    environment.mouse_dragging = true;
    environment.mouseDown(e);
});

environment.canvas.addEventListener('mouseup', function(e){
    environment.mouseUp(e);
});

environment.canvas.addEventListener('touchstart', function(e){
    environment.mouse_dragging = true;
    environment.mouseDown(e, true);
}, true);

environment.canvas.addEventListener('touchend', function(e){
    environment.mouse_dragging = false;
});

environment.canvas.addEventListener('mouseout', function(e){
    environment.mouse_dragging = false;
});

environment.canvas.addEventListener('touchmove', function(e){
    environment.mouseMove(e, true);
});

environment.canvas.addEventListener('mousemove', function(e){
    environment.mouseMove(e);
});

environment.canvas.addEventListener("wheel", function(e) {
    environment.mouseWheelScroll(e);
});

window.addEventListener('keydown', function(e){
    if (e.key === "Delete") {
        if(environment.node_is_selected && environment.selected_node_name) {
            environment.removeNode(environment.selected_node_type, environment.selected_node_name);
        }
        else if(environment.node_output_is_selected && environment.selected_node_name) {
            let node = environment.nodes[environment.selected_node_type][environment.selected_node_name];
            let child_node = null; 
            if(node.output_connections.length) {
                child_node = node.output_connections[0].child_node;
                if(child_node)
                    child_node.removeInputConnectionByNodeName(node.name);
                node.removeFirstOutputConnection();
                environment.draw();
            }
        }
        else if(environment.node_input_is_selected && environment.selected_node_name) {
            let node = environment.nodes[environment.selected_node_type][environment.selected_node_name];
            let parent_node = null; 
            if(node.input_connections.length) {
                parent_node = node.input_connections[0].parent_node;
                if(parent_node)
                    parent_node.removeOutputConnectionByNodeName(node.name);
                node.removeFirstInputConnection();
                environment.draw();
            }
        }
    }
});

// Turn off the context menu in the canvas.
environment.canvas.oncontextmenu = function (e){
    e.preventDefault();
};

// Create node on double click
environment.canvas.addEventListener("dblclick", function (e){
    environment.doubleClick(e);
});

// Canvas will resize to window.
window.addEventListener('resize', () => {
    environment.canvasResize();
    environment.toggleContextMenuOff();
});

let node_name_input = document.getElementById('node-code-title');
//let node_description_input = document.getElementById('node-description');


function keyupListener() 
{
    window.onkeyup = function(e) 
    {
      if ( e.keyCode === 27 ) 
      {
        environment.toggleContextMenuOff();
      }
    }
}

environment.menu.addEventListener("click", function(e)
{
    e.preventDefault();
    if(environment.menu_state === 1) // menu is active
    {
        let menu_item_link = environment.clickInsideElement(e, environment.context_menu_link_class_name);
        if(menu_item_link)
        {
            environment.menuItemListener(menu_item_link);
            //this.openCodeArea(node);
        }
        else
        {
            environment.toggleContextMenuOff();
        }
    }
});

function getExportJSON()
{
    let design_map_name = document.getElementById('header-title').value;
    if(!design_map_name)
        design_map_name = "Design Map";

    let node_jsons = {};

    for(let node_type of Object.keys(environment.nodes)) {
        let node_type_jsons = {};
        for(let node of Object.values(environment.nodes[node_type])) {
            let node_type_json = node.nodeToJSON();
            node_type_jsons[node.name] = node_type_json;
        }
        node_jsons[node_type] = node_type_jsons;
    }

    let export_json = {
        name: design_map_name,
        nodes: node_jsons
    }
    return export_json;
}

function exportJSON()
{
    let json = getExportJSON();
    let file_name = [json.name, 'json'].join('.'); 
    json = JSON.stringify(json, null, 3);
    let blob = new Blob([json], {type: "application/json;charset=utf-8"});
    let download_url = window.URL.createObjectURL(blob);
    let download_link = document.createElement('a');
    download_link.download = file_name;
    download_link.href = download_url;
    download_link.style.display = 'none';
    document.body.appendChild(download_link);

    download_link.click();
}

function saveJSON()
{
    document.getElementById('close').click(); // close the save prompt
    let json = getExportJSON();
    json = JSON.stringify(json, null, 3);

    fetch('/projects/jmap/conciousness', {
        method: 'POST',
        body: json,
        headers: {'Content-type': 'application/json;charset=UTF-8'}
    })
    .then(response => response.text())
    .then(text => alert(text))
    .catch(err => console.log(err));
}

file_input.onchange = function ()
{
    let file = this.files[0];
    let reader = new FileReader();
    reader.onload = function(progressEvent)
    {
        // By lines
        let json_string = this.result;
        json = JSON.parse(json_string);
        environment.loadNewNodesFromJSON(json);
    };
    reader.readAsText(file);
};


let map_node_drag = document.getElementById('map-node');
let note_node_drag = document.getElementById('note-node');

function insideOfCanvas(x, y)
{
    let offset = 64;
    let br = environment.canvas.getBoundingClientRect();
    let cx = br.left + environment.canvas.width;
    let cy = br.top + environment.canvas.height;
    return ((x <= cx && x >= br.left + offset) && (y <= cy && y >= br.top));
}

function dragDrop(e, node_type)
{
    e.preventDefault();
    let boundary_rect = environment.canvas.getBoundingClientRect();
    let raw_x = e.clientX - boundary_rect.left;
    let raw_y = e.clientY - boundary_rect.top;
    if(insideOfCanvas(raw_x, raw_y)) {
        environment.placeNode(node_type, raw_x, raw_y);
        environment.draw();
    }
}

map_node_drag.addEventListener('dragend', function(e) {
    dragDrop(e, 'map_nodes');
});

note_node_drag.addEventListener('dragend', function(e) {
    dragDrop(e, 'note_nodes');
});

environment.draw();

let url = window.location.href;
let correct_url = (url === 'http://www.jay-creations.com/projects/jmap/conciousness' || url === 'http://jay-creations.com/projects/jmap/conciousness');
if(correct_url)
{
    fetch('/projects/jmap/conciousness/data')
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        // Work with JSON data here
        environment.loadNewNodesFromJSON(data);
      })
      .catch((err) => {
        console.log(err);
      })
}


