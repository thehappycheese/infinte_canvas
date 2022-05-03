import { Rectangle, Vector2 } from "./geom";

export class GridBitmap{
    canvas:OffscreenCanvas;
    ctx:OffscreenCanvasRenderingContext2D;
    #position:Vector2;
    #extent:Rectangle
    constructor(position:Vector2, size:Vector2){
        this.canvas = new OffscreenCanvas(size.x, size.y);
        this.ctx = this.canvas.getContext("2d");
        this.#position = position;
        this.#extent = new Rectangle(position, position.add(size));
        this.ctx.fillStyle = "#3a3a3a";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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




