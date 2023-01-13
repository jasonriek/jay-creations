class NoteNode extends AbstractNode 
{
    constructor(name, canvas, ctx, x=0, y=0, w=128, h=64)
    {
        super(name, canvas, ctx, x, y, w, h);
        this.fill_color = "#FFFFED";
        this.type = 'note_nodes';
    }

    inRightBottomCorner(x, y)
    {
        let offset = 12;
        let rc_x = (this.x + this.w - 3);
        let rc_y = (this.y + this.h - 3);
        let in_x = (x <= (rc_x + offset) && x > (rc_x - offset));
        let in_y = (y <= (rc_y + offset) && y > (rc_y - offset));

        return in_x && in_y;
    }

    drawDragCorner()
    {
        let offset = 4;
        let rc_x = (this.x + this.w - offset);
        let rc_y = (this.y + this.h - offset);
        this.ctx.beginPath();
        this.ctx.moveTo(rc_x, rc_y - 7);
        this.ctx.lineTo(rc_x, rc_y);
        this.ctx.lineTo(rc_x - 7, rc_y);

        this.ctx.fillStyle = "#999999";
        this.ctx.fill();
    }

    resize(x, y)
    {
        this.w = this.w + (x - (this.x + this.w));
        this.h = this.h + (y - (this.y + this.h));
        this.input.x = this.x + this.w/2;
        this.input.y = this.y; 
        this.output.x = this.x + this.w/2;
        this.output.y = this.y + this.h;
    }

    draw(fill_color=null)
    {
        let fc = this.fill_color;
        if(fill_color)
            fc = fill_color;

        let display_text = this.description;
        let text_lines = display_text.split('\n'); 

        
        this.input.draw();
        this.output.draw();
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#999999";
        
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
        this.ctx.fillStyle = "#000000";
        this.ctx.font = "11px Monospace";

        let line_n = 1;
        let margin = 7;

        for(let text_line of text_lines)
        {
            this.ctx.fillText(text_line, this.x + margin, this.y + (12 * line_n) + margin);
            line_n++;
        }
        this.drawDragCorner();

    }

}