class MapNode extends AbstractNode
{
    constructor(name, canvas, ctx, x=0, y=0)
    {
        super(name, canvas, ctx, x, y);
        this.fill_color = "#333338";
        this.type = 'map_nodes';
    }

    draw(fill_color=null)
    {
        let fc = this.fill_color;
        if(fill_color)
            fc = fill_color;

        let d_top_text = "";
        let d_bot_text = "";
        let display_text = this.name;
        if(display_text.length >= 18)
            display_text = formatNodeTitle(display_text);
        
        this.input.draw();
        this.output.draw();
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#FFFFFF";
        
        this.ctx.roundRect(this.x, this.y, this.w, this.h, [9]);
        
        if(this.selected)
        {
            this.ctx.lineWidth=5;
            this.ctx.stroke();
        }
        this.ctx.fillStyle = fc;
        this.ctx.fill();

        // Labels //
        // Title
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "11px Monospace";

        if(display_text.length >= 18)
        {
            let split_text = display_text.split('\n');
            d_top_text = split_text[0];
            d_bot_text = split_text[1];
            this.ctx.fillText(d_bot_text, this.x + (this.w/2 - (this.ctx.measureText(d_top_text).width/2)), this.y + 10 + (this.h/2));
        }
        else
            d_top_text = display_text;
        this.ctx.fillText(d_top_text, this.x + (this.w/2 - (this.ctx.measureText(d_top_text).width/2)), this.y + (this.h/2));
    }
}