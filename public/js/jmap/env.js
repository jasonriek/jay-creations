const EDIT_SELECTION = "Edit";
const VIEW_SELECTION = "View";
const DELETE_SELECTION = "Delete";


class Grid 
{
    constructor(ctx, canvas)
    {
        this.width = canvas.width; 
        this.height = canvas.height;
        this.ctx = ctx;        
        this.canvas = canvas;
    }

    drawDot(x, y, radius)
    {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "#333333";
        this.ctx.fill();
    }

    draw() 
    {
        for(let x = 0; x < this.canvas.width; x+=SPACING)
            if(x % SPACING == 0)
                for(let y = 0; y < this.canvas.height; y+=SPACING)
                    if(y % SPACING == 0)
                        this.drawDot(x, y, 1.5);
    }
}

class Environment
{
    constructor()
    {
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.style.background = "#111111";
        // set the color of the line
        this.ctx.strokeStyle = '#999999';
        this.ctx.lineWidth = 1;

        this.mouse_dragging = false;
        this.code_window_is_up = false;
        this.node_is_selected = false;
        this.node_input_is_selected = false;
        this.node_output_is_selected = false;
        this.drawing_node_connection = false;
        this.selected_node_name = null;
        this.selected_node_type = null;
        this.selected_output_node_name = null;
        this.selected_input_node_name = null;
        this.last_mouse_hovered_node_name = null;

        this.grid = new Grid(this.ctx, this.canvas);

        this.nodes = {
            note_nodes: {},
            map_nodes: {}
        } 
        this.node_counters = {
            map_nodes: 1,
            note_nodes: 1
        }
        
        this.rx = 0;
        this.ry = 0;
        this.x = 0;
        this.y = 0;
        this.last_x = 0;
        this.last_y = 0;
        this.last_rx = 0;
        this.last_ry = 0;
        this.last_node_x = 0;
        this.last_node_y = 0;

        // context menu
        this.menu = document.querySelector("#context-menu");
        this.menu_state = 0;
        this.context_menu_class_name = "context-menu";
        this.context_menu_item_class_name = "context-menu__item";
        this.context_menu_link_class_name = "context-menu__link";
        this.context_menu_active = "context-menu--active";

        this.draw();
    }

    clickedInsideANodePlacementArea(x, y) 
    {
        for(let _nodes of Object.values(this.nodes)) {
            for(let node of Object.values(_nodes)) {
                if(node.inPlacementArea(x, y))
                    return true;
            }
        }
        return false;
    }

    clickedInsideANodeSelectionArea(x, y) 
    {
        for(let _nodes of Object.values(this.nodes)) {
            for(let node of Object.values(_nodes)) {
                if(node.inSelectionArea(x, y))
                    return true;
            }
        }
        return false;
    }

    inNodeInput(x, y)
    {
        for(let _nodes of Object.values(this.nodes)) {
            for(let node of Object.values(_nodes)) {
                if(node.input.inSelectionArea(x, y))
                    return true;
            }
        }
        return false;
    }

    inNodeConnection(x, y)
    {
        for(let _nodes of Object.values(this.nodes)) {
            for(let node of Object.values(_nodes)) {
                if(node.output_connection && (node.output_connection.inLine(x, y) || node.inCloseArea(x, y))) {
                    this.selected_node_name = node.name;
                    this.selected_node_type = node.type;
                    return true;
                }
            }
        }
        return false;
    }

    inNodeCloseConnection(x, y)
    {
        for(let _nodes of Object.values(this.nodes)) {
            for(let node of Object.values(_nodes)) {
                if(node.output_connection && node.output_connection.inCloseArea(x, y)) {
                    this.selected_node_name = node.name;
                    this.selected_node_type = node.type;
                    return true;
                }
            }

        }
        return false;
    }

    getIOSelectedNode()
    {
        for(let _nodes of Object.values(this.nodes)) {
            for(let node of Object.values(_nodes)) {
                if(node.IOSelected())
                    return node;
            }
        }
        return null;
    }

    getNodeFromOutputSelectionArea(x, y) 
    {
        for(let _nodes of Object.values(this.nodes)) {
            for(let node of Object.values(_nodes)) {
                if(node.output.inSelectionArea(x, y)) {
                    this.selected_node_name = node.name;
                    return node;
                }
            }
        }
        return null;
    }

    getNodeFromInputSelectionArea(x, y)
    {
        for(let _nodes of Object.values(this.nodes)) 
        {
            for(let node of Object.values(_nodes)) {
                if(node.input.inSelectionArea(x, y)) {
                    this.selected_node_name = node.name;
                    return node;
                }
            }
        }
        return null;
    }

    getNodeFromPosition(x, y) 
    {
        for(let _nodes of Object.values(this.nodes)) {
            for(let node of Object.values(_nodes)) {
                if(node.inSelectionArea(x, y)) {
                    return node;
                }
            }
        }
        return null;
    }

    clickInsideElement(e, className) 
    {
        let el = e.srcElement || e.target;
        if (el.classList.contains(className)) {
          return el;
        } 
        else {
            while ( el = el.parentNode ) {
                if(el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }
    }
    
    toggleContextMenuOn() 
    {
        if (this.menu_state !== 1) 
        {
          this.menu_state = 1;
          this.menu.classList.add(this.context_menu_active);
        }
    }
    
    toggleContextMenuOff() 
    {
        if (this.menu_state !== 0) 
        {
          this.menu_state = 0;
          this.menu.classList.remove(this.context_menu_active);
        }
    }

    menuItemListener(link) 
    {
        let node = this.nodes[this.selected_node_type][this.selected_node_name];
        let selection = link.getAttribute("data-action");
        switch(selection)
        {
            case EDIT_SELECTION:
                this.openEditor(node);
                break;
            case VIEW_SELECTION:
                openPanel();
                break;
            case DELETE_SELECTION:
                this.removeNode(this.selected_node_type, this.selected_node_name);
                break;
        }
        this.toggleContextMenuOff();
    }
    
    positionContextMenu(x, y)
    {
        let menu_width = this.menu.offsetWidth + 4;
        let menu_height = this.menu.offsetHeight + 4;
        let window_width = window.innerWidth;
        let window_height = window.innerHeight;
        if((window_width - x) < menu_width) 
        {
            this.menu.style.left = window_width - menu_width + "px";
        } 
        else 
        {
            this.menu.style.left = x + "px";
        }
        if((window_height - y) < menu_height ) 
        {
            this.menu.style.top = window_height - menu_height + "px";
        } 
        else 
        {
            this.menu.style.top = y + "px";
        }
    }

    setNodeToSelected(node) 
    {
        if(node)
        {
            this.selected_node_name = node.name;
            this.selected_node_type = node.type;
            this.deselectNodes();
            this.nodes[this.selected_node_type][this.selected_node_name].selected = true;
            this.node_output_is_selected = false;
            this.node_input_is_selected = false;
            this.node_is_selected = true;
        }
        else 
            this.node_is_selected = false;
    }

    setNodeOutputToSelected(node, x, y)
    {
        this.deselectNodes();
        this.node_is_selected = false;
        this.node_output_is_selected = true;
        this.node_input_is_selected = false;

        if(node.output.inSelectionArea(x, y))
        {
            node.output.selected = true;
            this.selected_output_node_name = node.name;
            this.selected_node_type = node.type;
        }
        else
        {
            this.setNodeToSelected(node);
            this.selected_output_node_name = null;
        }
    }

    setNodeInputToSelected(node, x, y)
    {
        this.deselectNodes();
        this.node_is_selected = false;
        this.node_output_is_selected = false;
        this.node_input_is_selected = true;

        if(node.input.inSelectionArea(x, y))
        {
            node.input.selected = true;
            this.selected_input_node_name = node.name;
            this.selected_node_type = node.type;
        }
        else
        {
            this.setNodeToSelected(node);
            this.selected_input_node_name = null;
        }
    }

    deselectNodes()
    {
        Object.values(this.nodes).forEach(_nodes => {Object.values(_nodes).forEach(node => {node.selected = false;});});
        Object.values(this.nodes).forEach(_nodes => {Object.values(_nodes).forEach(node => {node.input.selected = false;});});
        Object.values(this.nodes).forEach(_nodes => {Object.values(_nodes).forEach(node => {node.output.selected = false;});});
        this.draw();
    }

    createNewNode(node_type, node_name, x, y, w=128, h=64)
    {
        switch(node_type)
        {
            case 'map_nodes':
                return new MapNode(node_name, this.canvas, this.ctx, x, y, w, h);
            case 'note_nodes':
                return new NoteNode(node_name, this.canvas, this.ctx, x, y, w, h);
        }
        return null; // no node under that name
    }

    placeNode(node_type, x, y, node_name=null) 
    {
        if(!node_name)
        {
            node_name = `${node_type}_${this.node_counters[node_type]}`;
            while(node_name in this.nodes[node_type])
            {
                this.node_counters[node_type]++;
                node_name = `${node_type}_${this.node_counters[node_type]}`;
            }
        }
        this.nodes[node_type][node_name] = this.createNewNode(node_type, node_name, x, y);
        this.nodes[node_type][node_name].place(x, y);
    }

    // Creates a new node
    mouseDown(event, touch=false)
    {
        let boundary_rect = this.canvas.getBoundingClientRect();
        let client_x = null;
        let client_y = null;
        if(touch)
        {
            client_x = event.touches[0].clientX;
            client_y = event.touches[0].clientY;
        }
        else
        {
            client_x = event.clientX;
            client_y = event.clientY;
        }

        let raw_x = client_x - boundary_rect.left;
        let raw_y = client_y - boundary_rect.top;
        let button = event.which || event.button;

        let output_node = this.getNodeFromOutputSelectionArea(raw_x, raw_y);
        let input_node = this.getNodeFromInputSelectionArea(raw_x, raw_y);
        
        if(output_node) // Inside node output selection
        {
            this.setNodeOutputToSelected(output_node, raw_x, raw_y);
            this.toggleContextMenuOff();
            document.body.style.cursor = "grabbing";
        }
        
        else if(input_node) // Inside node input selection
        {
            this.setNodeInputToSelected(input_node, raw_x, raw_y);
            this.toggleContextMenuOff();
            document.body.style.cursor = "grabbing";
        }

        // Inside a node selection area
        
        else if(this.clickedInsideANodeSelectionArea(raw_x, raw_y))
        {
            //this.deselectNodes();
            let node = this.getNodeFromPosition(raw_x, raw_y);
            document.body.style.cursor = "grabbing";
            
            if(button === 3) // right clicked
            {
                if(node)
                {
                    event.preventDefault();
                    this.toggleContextMenuOn();
                    this.positionContextMenu(raw_x, raw_y);
                    this.setNodeOutputToSelected(node, raw_x, raw_y);
                    this.last_node_x = node.x;
                    this.last_node_y = node.y;
                    document.getElementById('block-name').innerHTML = node.name;
                    document.getElementById('block-description').value = node.description;
                }
            }

            else // left clicked
            {
                if(node && node.inCloseArea(raw_x, raw_y) && node.selected)
                {
                    this.removeNode(node.type, node.name);
                }
                else if(node)
                {
                    this.setNodeOutputToSelected(node, raw_x, raw_y);
                    this.last_node_x = node.x;
                    this.last_node_y = node.y;
                    document.getElementById('block-name').innerHTML = node.name;
                    document.getElementById('block-description').value = node.description;
                    //openPanel();
                }
                this.toggleContextMenuOff();
            }
        }
        

        // No node or node IO is here
        else
        {
            if(this.inNodeCloseConnection(raw_x, raw_y))
            {
                let output_connections = this.nodes[this.selected_node_type][this.selected_node_name].output_connection;
                let c_node = null;
                if(output_connections.length)
                {
                    c_node = output_connections[0].child_node;
                    delete output_connections[0].child_node.input_connections;
                    delete output_connections[0].parent_node.output_connections;
                }
                    
                this.selected_node_name = null;
                this.selected_node_type = null;
            }
            closePanel();
            this.deselectNodes();
            this.toggleContextMenuOff();
            this.node_is_selected = false;
            this.selected_node_name = null;
            this.selected_node_type = null;
            this.node_output_is_selected = false;
            this.selected_output_node_name = null;
            this.selected_input_node_name = null;
        }
        this.draw();
    }

    openEditor(node)
    {
        if(node && node.selected)
        {
            document.body.style.cursor = "auto";
            node_title.value = `${node.name}`;
            editor.value = node.description;
            modal.style.display = "block";
            editor.focus();
        }
    }

    doubleClick(event)
    {
        let boundary_rect = this.canvas.getBoundingClientRect();
        let raw_x = event.clientX - boundary_rect.left;
        let raw_y = event.clientY - boundary_rect.top;
        let sticky_x = sticky(raw_x);
        let sticky_y = sticky(raw_y);
        if(!this.clickedInsideANodePlacementArea(sticky_x, sticky_y))
        {
            this.placeNode("map_nodes", sticky_x, sticky_y);
            this.last_node_x = sticky_x;
            this.last_node_y = sticky_y;
            this.draw();
        }
        else if(this.clickedInsideANodeSelectionArea(raw_x, raw_y))
        {
            let node = this.getNodeFromPosition(raw_x, raw_y);
            if(node && node.selected)
            {
                this.openEditor(node);
            }
        }

    }

    mouseMove(event, touch=false)
    {
        let boundary_rect = this.canvas.getBoundingClientRect();
        let client_x = null;
        let client_y = null;
        if(touch)
        {
            client_x = event.touches[0].clientX;
            client_y = event.touches[0].clientY;
        }
        else
        {
            client_x = event.clientX;
            client_y = event.clientY;
        }

        let raw_x = client_x - boundary_rect.left;
        let raw_y = client_y - boundary_rect.top;
        this.last_rx = this.rx;
        this.last_ry = this.ry;
        this.rx = raw_x;
        this.ry = raw_y;

        this.last_x = this.x;
        this.last_y = this.y;
        this.x = sticky(raw_x);
        this.y = sticky(raw_y);

        let x_dif = dragDirection(this.last_rx, this.rx);
        let y_dif = dragDirection(this.last_ry, this.ry);
        
        if(this.mouse_dragging)
        {
            // Move the selected node or resize
            if(this.node_is_selected)
            {
                let node = this.nodes[this.selected_node_type][this.selected_node_name];
                if(node.type === 'note_nodes' && node.inRightBottomCorner(raw_x, raw_y))
                {
                    node.resize(raw_x, raw_y);
                    document.body.style.cursor = "nwse-resize";
                }
                else
                {
                    node.place(raw_x - (node.w/2), raw_y - (node.h/2));
                    document.body.style.cursor = "grabbing";
                } 
            }
            // Node output is selected on the node
            else if(this.node_output_is_selected && this.selected_output_node_name)
            {
                this.drawing_node_connection = true;
            }
            // Move everything
            else 
            {
                document.body.style.cursor = "move";
                for(let _nodes of Object.values(this.nodes)) {
                    for(let node of Object.values(_nodes)) {
                        node.place(node.x + x_dif, node.y + y_dif);
                    }
                }

            }
            this.draw();
        }
        else
        {
            let node = this.getNodeFromPosition(raw_x, raw_y);
            if(node) {
                Object.values(this.nodes[node.type]).forEach(node => {node.has_mouse_over_it = false});
                if(this.selected_node_name === node.name) {
                    if(node.type === 'note_nodes' && node.inRightBottomCorner(raw_x, raw_y))
                        document.body.style.cursor = "nwse-resize";
                    else
                        document.body.style.cursor = "grab"; 
                }
                else if(node.type === 'note_nodes' && node.inRightBottomCorner(raw_x, raw_y))
                    document.body.style.cursor = "nwse-resize";
                else
                    document.body.style.cursor = "pointer";
                node.has_mouse_over_it = true;
            }
            else {
                let output_node = this.getNodeFromOutputSelectionArea(raw_x, raw_y);
                let input_node = this.getNodeFromInputSelectionArea(raw_x, raw_y);
                if(output_node)
                    document.body.style.cursor = "pointer";
                else if(input_node)
                    document.body.style.cursor = "pointer";
                else {
                    for(let _nodes of Object.values(this.nodes)) {
                        for(let node of Object.values(_nodes)) {
                            node.has_mouse_over_it = false
                        }
                    }
                    document.body.style.cursor = "auto";
                }
            }
            
            if(node && node.inCloseArea(raw_x, raw_y) && node.selected)
            {
                showCloseButton(this.ctx, (node.x + node.w) - CLOSE_AREA_SPACING, node.y, CLOSE_AREA_SPACING);
                document.body.style.cursor = "pointer";
            }


            else
            { 
                this.draw();
            }
            this.drawing_node_connection = false;
            
        }
    }

    mouseWheelScroll(event)
    {
        this.last_ry = this.ry;
        this.ry = this.ry + event.deltaY;
        let y_dif = dragDirection(this.last_ry, this.ry);
        for(let node_type of Object.keys(this.nodes))
            for(let node of Object.values(this.nodes[node_type]))
                node.place(node.x, node.y - y_dif);
        this.draw();

    }

    mouseUp(event)
    {   
        let boundary_rect = this.canvas.getBoundingClientRect();
        let raw_x = event.clientX - boundary_rect.left;
        let raw_y = event.clientY - boundary_rect.top;
        this.last_rx = this.rx;
        this.last_ry = this.ry;
        this.rx = raw_x;
        this.ry = raw_y;
        let sticky_x = sticky(raw_x);
        let sticky_y = sticky(raw_y);
        this.last_x = sticky_x;
        this.last_y = sticky_y;

        let node = this.getNodeFromPosition(sticky_x, sticky_y);
        if(node)
            document.body.style.cursor = "grab";

        if(this.drawing_node_connection)
        {
            if(!node && !this.clickedInsideANodePlacementArea(sticky_x, sticky_y))
            {
                this.placeNode(this.selected_node_type, sticky_x, sticky_y);
                this.last_node_x = sticky_x;
                this.last_node_y = sticky_y;
                node = this.getNodeFromPosition(sticky_x, sticky_y);
                this.setNewNodeConnection(node.input.x, node.input.y);
                this.draw();
            }
            this.drawing_node_connection = false;
        }
        this.mouse_dragging = false;
    }
    
    renameNode(input)
    {
        let new_node_name = input.value;
        new_node_name = strip(new_node_name);
        let old_node_name = this.selected_node_name;
        if(new_node_name === old_node_name)
        {
            return;
        }
        if(new_node_name in this.nodes[this.selected_node_type])
        {
            alert(`Name "${new_node_name}" already exists.`);
            input.value = old_node_name;
            return;
        }
        if(old_node_name in this.nodes[this.selected_node_type])
        {
            // Make sure node name change reflects in all nodes.
            let temp_node = this.nodes[this.selected_node_type][old_node_name];
            temp_node.setName(new_node_name);
            delete this.nodes[this.selected_node_type][old_node_name];
            this.nodes[this.selected_node_type][new_node_name] = temp_node;
            this.selected_node_name = new_node_name;
            this.draw();
        }
    }

    setNodeDescription(description)
    {
        if(this.selected_node_type && this.selected_node_name)
            this.nodes[this.selected_node_type][this.selected_node_name].setDescription(description);
    }

    removeConnections(connections, node, input_connections=true)
    {
        if(connections.length) {
            for(let connection of connections) {
                if(input_connections)
                    connection.parent_node.removeOutputConnectionByNodeName(node.name);
                else
                    connection.child_node.removeInputConnectionByNodeName(node.name);
            }
        }
    } 

    // Will remove node from nodes if the name exists.
    removeNode(node_type, node_name)
    {
        if(node_name && node_name in this.nodes[node_type])
        {
            let node = this.nodes[node_type][node_name];
            let input_connections = node.input_connections;
            let output_connections = node.output_connections;
            this.removeConnections(input_connections, node, true);
            this.removeConnections(output_connections, node, false);
            delete this.nodes[node_type][node_name];
            this.deselectNodes();
        }
        this.draw();
    }

    drawConnection(parent_x, parent_y, dest_x, dest_y)
    {
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(parent_x, parent_y);
        this.ctx.quadraticCurveTo(parent_x, parent_y + 50, dest_x, dest_y);
        this.ctx.stroke();
    }

    setConnection()
    {
        let p_node = this.nodes[this.selected_node_type][this.selected_output_node_name];
        let c_node = this.getNodeFromInputSelectionArea(this.rx, this.ry);
        if(c_node)
        {
            this.rx = c_node.input.x;
            this.ry = c_node.input.y;
            p_node.output_connections.push(new NodeConnection(this.ctx, p_node, c_node));
            c_node.input_connections.push(p_node.output_connections[p_node.output_connections.length - 1]);
            this.drawing_node_connection = false;
            this.mouse_dragging = false;
            this.node_output_is_selected = false;
            this.selected_output_node_name = null;
            this.selected_input_node_name = null;
            this.deselectNodes();        
        }
        this.drawConnection(p_node.output.x, p_node.output.y, this.rx, this.ry);
    }

    setNewNodeConnection(input_x, input_y)
    {
        let p_node = this.nodes[this.selected_node_type][this.selected_output_node_name];
        let c_node = this.getNodeFromInputSelectionArea(input_x, input_y);
        if(c_node)
        {
            p_node.output_connections.push(new NodeConnection(this.ctx, p_node, c_node));
            c_node.input_connections.push(p_node.output_connections[p_node.output_connections.length - 1]);
            this.drawing_node_connection = false;
            this.mouse_dragging = false;
            this.node_output_is_selected = false;
            this.selected_output_node_name = null;
            this.selected_input_node_name = null;
            this.deselectNodes();  
        }
    }

    draw()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw the grid.
        this.grid.draw();

        // Draw node output connection line 
        if(this.drawing_node_connection)
            this.setConnection();

        // Draw the nodes connections
       for(let node_type of Object.keys(this.nodes))
            for(let node of Object.values(this.nodes[node_type]))
                node.drawConnections();
        
        // Draw nodes
        for(let node_type of Object.keys(this.nodes)) {
            for(let node of Object.values(this.nodes[node_type])) {
                let fc = null;
                if(node.has_mouse_over_it && node_type === 'map_nodes')
                    fc = "#363639";
                node.draw(fc);
            }
        }
    }

    loadNewNodesFromJSON(json)
    {
        let header_title_input = document.getElementById('header-title');
        let node = null;
        let node_names = {};
        // Make sure the json isn't empty
        if(Object.values(json).length)
        {
            for(let node_type of Object.keys(this.nodes)) {
                this.nodes[node_type] = {};
            }
            header_title_input.value = json.name;
            for(let [node_type, node_type_data] of Object.entries(json.nodes)) {
                node_names[node_type] = [];
                for(let [node_name, node_data] of Object.entries(node_type_data)) {
                    node = this.createNewNode(
                        node_type,
                        node_name,
                        node_data.x,
                        node_data.y,
                        node_data.w,
                        node_data.h
                    );
                    node.setDescription(node_data.description);
                    this.nodes[node_type][node_name] = node;
                    node_names[node_type].push(node_name);
                }
            }

            // Add node connections after creation of nodes
            for(let [node_type, node_type_names] of Object.entries(node_names))
            {
                for(let name of node_type_names) {
                    let json_input_connections = json.nodes[node_type][name].input_connections;
                    let json_output_connections = json.nodes[node_type][name].output_connections;
                    
                    this.addConnectionsFromJson(json_input_connections, node_type, name, true);
                    this.addConnectionsFromJson(json_output_connections, node_type, name, false);
                }
            }
            this.draw();
        }
    }

    addConnectionsFromJson(json_connections, node_type, node_name, is_input_connection=true)
    {
        let connection = null;
        for(let connection_data of json_connections)
        {
            connection = new NodeConnection(this.ctx,
                this.nodes[connection_data.parent_node_type][connection_data.parent_node_name],
                this.nodes[connection_data.child_node_type][connection_data.child_node_name]);
        
            if(is_input_connection)
                this.nodes[node_type][node_name].input_connections.push(connection)
            else
                this.nodes[node_type][node_name].output_connections.push(connection);
        }
    }

    canvasResize() 
    {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.draw();
    }
}