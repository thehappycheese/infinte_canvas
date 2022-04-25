import { Rectangle, Vector2 } from "./geom";

class GridBitmap{
    canvas:OffscreenCanvas;
    ctx:OffscreenCanvasRenderingContext2D;
    #position:Vector2;
    #extent:Rectangle
    constructor(position:Vector2, size:Vector2){
        this.canvas = new OffscreenCanvas(size.x, size.y);
        this.ctx = this.canvas.getContext("2d");
        this.#position = position;
        this.#extent = new Rectangle(position, position.add(size));
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, 1, 1);
        this.ctx.fillStyle = "purple";
    }
    get position(){
        return this.#position;
    }
    get extent(){
        return this.#extent;
    }
    world_to_local(world_pos:Vector2){
        return world_pos.sub(this.#position);
    }
}

interface Drawable{
    draw(ctx:CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D):void;
    bounding_rectangle():Rectangle;
    transformed(transformation:(points:Vector2)=>Vector2):Drawable;
}


class Polygon implements Drawable{
    points:Vector2[];
    constructor(points:Vector2[]){
        this.points = points;
    }
    draw(ctx:CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D){
        ctx.beginPath();
        for(let i = 0; i < this.points.length; i++){
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
    }
    bounding_rectangle():Rectangle{
        return new Rectangle(
            this.points.reduce((a,b)=> new Vector2(
                Math.min(a.x, b.x),
                Math.min(a.y, b.y)
            )),
            this.points.reduce((a,b)=> new Vector2(
                Math.max(a.x, b.x),
                Math.max(a.y, b.y)
            )),
        );
    }
    transformed(transformation:(points:Vector2)=>Vector2):Polygon{
        return new Polygon(this.points.map(transformation));
    }
}


export class CanvasGrid{
    bitmaps:GridBitmap[];
    cell_size:Vector2;
    constructor(cell_size:Vector2){
        this.bitmaps = [];
    }
    render_to_viewport(viewport:Viewport){
        let bitmaps_to_draw = this.get_within_rectangle(viewport.world_extent());
        for(let bitmap of this.bitmaps){
            viewport.ctx.drawImage(bitmap.canvas, bitmap.position.x, bitmap.position.y);
        }
    }

    get_within_rectangle(rect:Rectangle){
        return this.bitmaps.filter(b => rect.overlaps(b.extent));
    }
    /**
     * 
     * @param polygon A polygon to render, given in world coordinates
     */
    draw_polygon(polygon_world:Polygon){
        let polygon_bounds = polygon_world.bounding_rectangle().padded(this.cell_size);
        let bitmaps_to_draw = this.get_within_rectangle(polygon_bounds);
        for(let bitmap of bitmaps_to_draw){
            let polygon_local = polygon_world.transformed(p => bitmap.world_to_local(p));
            polygon_local.draw(bitmap.ctx);
        }
    }

}


/**
 * The Viewport holds the transform information needed to
 *  - make draw calls to the main overlay canvas
 *  - find out which grid cells are visible
 *  - transform user input into world coordinates
 * 
 * The viewport is passed to the CanvasGrid to render the grid to the main canvas
 * 
 * - a reference to the canvas element
 * - a reference to the canvas 2d context
 * - the current zoom
 * - the current centre
 */
export class Viewport{
    canvas:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    _zoom:number=1;
    _centre:Vector2 = new Vector2(0, 0);
    constructor(canvas:HTMLCanvasElement){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }
    pixel_length_to_world_length(length:number):number{
        return length/this._zoom;
    }
    world_length_to_pixel_length(length:number):number{
        return length*this._zoom;
    }

    viewport_to_world(viewport_pixel:Vector2):Vector2{
        return viewport_pixel.sub(this.top_left()).div(this._zoom);
    }
    world_to_viewport(world_point:Vector2):Vector2{
        return world_point.mul(this._zoom).add(this.top_left());
    }

    get zoom():number{
        return this._zoom;
    }
    set zoom(zoom:number){
        this._zoom = zoom;
    }
    get centre():Vector2{
        return this._centre;
    }
    set centre(centre:Vector2){
        this._centre = centre;
    }

    /**
     * @returns the top left corner of the viewport in world coordinates
     */
    top_left():Vector2{
        return this._centre.sub(this.half_width_height());
    }

    /**
     * @ returns half the width and height of the viewport in world coordinates
     */
    half_width_height():Vector2{
        return new Vector2(this.canvas.width/2/this._zoom, this.canvas.height/2/this._zoom);
    }


    world_extent():Rectangle{
        let half_width_height = this.half_width_height();
        return new Rectangle(this._centre.sub(half_width_height), this._centre.add(half_width_height));
    }
}