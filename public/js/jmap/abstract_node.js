class AbstractIONode
{
    constructor(ctx, x, y)
    {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.selected = false;
    }

    inSelectionArea(x, y)
    {
        let dx = x - this.x;
        let dy = y - this.y;
        let distance = Math.abs(Math.sqrt(dx*dx + dy*dy));
        return (distance <= INOUT_DIAMETER)
    }

    draw()
    {
        this.ctx.beginPath();
        this.ctx.fillStyle="#666666";
        this.ctx.strokeStyle="#FFFFFF";
        this.ctx.arc(this.x, this.y, INOUT_DIAMETER, 0, 2 * Math.PI, false);
        if(this.selected)
        {
            this.ctx.lineWidth=5;
            this.ctx.stroke();
        }
        this.ctx.fill();
        
    }
}
class InputNode extends AbstractIONode
{
    constructor(ctx, x, y, node_w, node_h)
    {
        super(ctx, x + node_w/2, y);
        this.ctx = ctx;
        this.node_w = node_w;
        this.node_h = node_h;
    }
}
class OutputNode extends AbstractIONode
{
    constructor(ctx, x, y, node_w, node_h)
    {
        super(ctx, x + node_w/2, y + node_h);
        this.ctx = ctx;
        this.node_w = node_w;
        this.node_h = node_h;
    }
}

class NodeConnection
{
    constructor(ctx, parent_node, child_node)
    {
        this.ctx = ctx;
        this.parent_node = parent_node;
        this.child_node = child_node;
    }

    drawArrowHead(x1, y1, x2, y2) {
        this.ctx.beginPath();
        let arrowAngle = Math.atan2(x1 - x2, y1 - y2) + Math.PI;
        let arrowWidth = 12;
        this.ctx.moveTo(x2 - (arrowWidth * Math.sin(arrowAngle - Math.PI / 6)), 
                   y2 - (arrowWidth * Math.cos(arrowAngle - Math.PI / 6)));
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x2 - (arrowWidth * Math.sin(arrowAngle + Math.PI / 6)), 
                   y2 - (arrowWidth * Math.cos(arrowAngle + Math.PI / 6)));
    }

    draw()
    {
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        // Green = "#00CC00"
        this.ctx.strokeStyle = "#FFFFFF";
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.moveTo(this.parent_node.output.x, this.parent_node.output.y);
        this.ctx.quadraticCurveTo(this.parent_node.output.x, this.parent_node.output.y + 50, this.child_node.input.x, this.child_node.input.y);
        this.ctx.stroke();
        let offset = 1;
        this.drawArrowHead(this.parent_node.output.x - offset, this.parent_node.output.y - offset, this.child_node.input.x - offset, this.child_node.input.y - offset);
        this.ctx.fill();
        //this.ctx.lineTo(this.child_node.input.x, this.child_node.input.y);
    }

    inLine(x, y)
    {
        let x_1 = this.parent_node.output.x;
        let y_1 = this.parent_node.output.y;
        let x_2 = this.child_node.input.x;
        let y_2 = this.child_node.input.y;

        let max_x = Math.max(x_1, x_2);
        let min_x = Math.min(x_1, x_2);
        let max_y = Math.max(y_1, y_2);
        let min_y = Math.min(y_1, y_2);

        let m = parseFloat( ((y_1 - y_2)/(x_1 - x_2)).toFixed(1) ); // slope
        let m_2 = parseFloat( ((y_1 - y)/(x_1 - x)).toFixed(1) );
        let in_line = (m === m_2) && (y >= min_y && y <= max_y) && (x >= min_x && x <= max_x);
        //console.log(`${m} === ${m_2} (x: ${x}, y: ${y}) (x_1: ${x_1}, y_1: ${y_1}) (x_2: ${x_2}, y_2: ${y_2}) - In Line: ${in_line}`);
        return(in_line)
    }
    
    inCloseArea(x, y)
    {
        let x_1 = this.parent_node.output.x;
        let y_1 = this.parent_node.output.y;
        let x_2 = this.child_node.input.x;
        let y_2 = this.child_node.input.y;
        let close_radius = CLOSE_AREA_SPACING/2;
        let mid_x = midX(x_1, x_2);
        let mid_y = midY(y_1, y_2);
        return (x >=  mid_x - close_radius && x <= mid_x + close_radius) && (y >= mid_y - close_radius && y <= mid_y + close_radius);
    }
}

class AbstractNode 
{
    constructor(name, canvas, ctx, x=0, y=0, w=128, h=64)
    {
        this.name = name;
        this.description = '';
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.last_x = x;
        this.last_y = y;
        this.w = w;
        this.h = h;
        this.selected = false;
        this.input = new InputNode(this.ctx, this.x, this.y, this.w, this.h);
        this.output = new OutputNode(this.ctx, this.x, this.y, this.w, this.h);
        this.input_connections = [];
        this.output_connections = [];
        this.fill_color = "#0A45AA";
        this.has_mouse_over_it = false;
    }

    setName(name)
    {
        this.name = name;
    }

    setDescription(description)
    {
        this.description = description;
    }

    inputSelected()
    {
        return this.input.selected;
    }

    outputSelected()
    {
        return this.output.selected;
    }

    IOSelected()
    {
        return (this.inputSelected() || this.outputSelected());
    }

    inPlacementArea(x, y)
    {
        return( (x >= this.x - this.w && x <= this.x + this.w) && (y >= this.y - this.h && y <= this.y + this.h) );
    }

    inSelectionArea(x, y)
    {
        return( (x >= this.x && x <= this.x + this.w) && (y >= this.y && y <= this.y + this.h) );
    }

    inCloseArea(x, y)
    {
        return ( (x >= this.x + (this.w - CLOSE_AREA_SPACING) && x <= this.x + (this.w - 1)) && (y >= this.y - CLOSE_AREA_SPACING && y <= this.y + CLOSE_AREA_SPACING) );
    }

    place(x, y)
    {
        this.last_x = this.x;
        this.last_y = this.y;
        if(!(this.x || this.y))
        {
            this.last_x = x;
            this.last_y = y;
        }
        this.x = x;
        this.y = y;
        this.input.x = x + this.w/2;
        this.input.y = y; 
        this.output.x = x + this.w/2;
        this.output.y = y + this.h;
    }

    moved()
    {
        return (this.x !== this.last_x || this.y !== this.last_y);
    }

    removeFirstOutputConnection()
    {
        if(this.output_connections.length)
            this.output_connections.splice(0, 1);
    }

    removeFirstInputConnection()
    {
        if(this.input_connections.length)
            this.input_connections.splice(0, 1);
    }

    removeOutputConnectionByNodeName(node_name)
    {
        for(let i = 0; i < this.output_connections.length; i++) {
            if(this.output_connections[i].child_node.name === node_name) {
                this.output_connections.splice(i, 1);
            }
        }
    }

    removeInputConnectionByNodeName(node_name)
    {
        for(let i = 0; i < this.input_connections.length; i++) {
            if(this.input_connections[i].parent_node.name === node_name) {
                this.input_connections.splice(i, 1);
            }
        }
    }

    drawConnections()
    {
        if(this.input_connections.length)
            for(let connection of this.input_connections) {
                connection.draw();
            }
            
        if(this.output_connections.length)
            for(let connection of this.output_connections) {
            connection.draw();
        }
    }

    getConnectionsForJSON(connections)
    {
        let json_connections = [];
        let pn_type = '';
        let pn_name = '';
        let cn_type = '';
        let cn_name = '';
        
        for(let connection of connections) {

            pn_name = '';
            if(connection.parent_node) {
                pn_type = connection.parent_node.type;
                pn_name = connection.parent_node.name;
            }

            cn_name = '';
            if(connection.child_node) {
                cn_type = connection.child_node.type;
                cn_name = connection.child_node.name;
            }

            json_connections.push({
                parent_node_type: pn_type,
                parent_node_name: pn_name,
                child_node_type: cn_type,
                child_node_name: cn_name
            })
        }
        return json_connections;
    }

    nodeToJSON()
    {
        // Remember to add the input/output connections toos
        return {
            description: this.description,
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h,
            output_connections: this.getConnectionsForJSON(this.output_connections),
            input_connections: this.getConnectionsForJSON(this.input_connections)
        }
    }
}