    const SPACING = 32;
    const CLOSE_AREA_SPACING = 16;
    const INOUT_DIAMETER = 8;
    const PY_SPACE = "    ";
    const NOTE_TITLE_LIMIT_LENGTH = 34;
    const PI2 = Math.PI * 2;
    //const TEMP_RUN_FINISHED = 'FINISHED'; 
    
    // Makes the placement position stick to the grid
    function sticky(n)
    {
        return Math.trunc(n / SPACING) * SPACING;
    }

    function dragDirection(last_n, n)
    {
        difference = Math.abs(last_n - n);
        if(last_n > n)
            return -difference;
        else if(last_n < n)
            return difference;
        return 0;
    }

    function showCloseButton(ctx, x, y, n)
    {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle="#212121";
        
        let shift = n / 9;
        ctx.arc(x + n/2, y + n/2, n, 0, 2 * Math.PI, false);
        ctx.fill();
            
        ctx.beginPath();
        ctx.moveTo(x + shift, y + shift);
        ctx.lineTo(x + n - shift, y + n - shift);
            
        ctx.moveTo(x + n - shift, y + shift);
        ctx.lineTo(x + shift, y + n - shift);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#EEEEEE';
        ctx.stroke();
    }

    function showConnectionCloseButton(ctx, x, y, n)
    {
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.fillStyle="#212121";
        
        let shift = n / 9;
        ctx.arc(x, y, n, 0, 2 * Math.PI, false);
        ctx.fill();
            
        ctx.beginPath();
        ctx.moveTo(x - n + 5, y - n + 5);
        ctx.lineTo(x + n - 5, y + n - 5);

        ctx.moveTo(x + n - 5, y - n + 5);
        ctx.lineTo(x - n + 5, y + n - 5);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#EEEEEE';
        ctx.stroke();
    }

    function distance(x_2, x_1, y_2, y_1)
    {
        return Math.abs(Math.sqrt((x_2 - x_1)*(x_2 - x_1), (y_2 - y_1)*(y_2 - y_1)))
    }

    function midX(x_1, x_2)
    {
        return (x_1 + x_2)/2;
    }

    function midY(y_1, y_2)
    {
        return (y_1+y_2)/2;
    }

    function strip(string) {
        return string.replace(/^\s+|\s+$/g, '');
    }

    function capitalize(string)
    {
        let split_string = string.split('_')
        for(let i=0; i<split_string.length; i++)
        {
            split_string[i] = split_string[i][0].toUpperCase() + split_string[i].slice(1).toLowerCase();
        }
        return split_string.join('_');
    }

    function formatNodeTitle(node_title)
    {
        let node_title_length = node_title.length;
        if(node_title_length > NOTE_TITLE_LIMIT_LENGTH)
            node_title_length = NOTE_TITLE_LIMIT_LENGTH;

        display_text = [];
        for(let i = 0; i < node_title_length; i++)
        {
            if(i === 17)
                display_text.push('\n');
            display_text.push(node_title[i]);
        }
        return display_text.join('');
    }


/* Side Panel */

function openPanel() {
    let panel = document.getElementById("side-panel");
    panel.style = `
        width: 250px;
        padding-left: 9px;
        padding-right: 18px;
        border-right: 1px solid #555555;
    `;
}
  
function closePanel() {
    let panel = document.getElementById("side-panel");
    panel.style.width = "0";
    panel.style.paddingLeft = "0";
    panel.style.paddingRight = "0";
    panel.style.borderRight = "none";
    
}