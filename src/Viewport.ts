import { Rectangle, Vector2 } from "./geom";

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


export class Viewport {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    _zoom: number = 1;
    _centre: Vector2 = new Vector2(0, 0);

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }

    pixel_length_to_world_length(length: number): number {
        return length / this._zoom;
    }

    world_length_to_pixel_length(length: number): number {
        return length * this._zoom;
    }

    viewport_to_world(viewport_pixel: Vector2): Vector2 {
        return this._centre.add(viewport_pixel.div(this._zoom));
    }
    
    world_to_viewport(world_point: Vector2): Vector2 {
        return world_point.sub(this._centre).div(this._zoom);
    }

    translate(delta: Vector2) {
        this._centre = this._centre.add(delta);
    }
    zoom_by(factor:number){
        this._zoom *= factor;
    }
    reset_view(){
        this._zoom = 1;
        this._centre = new Vector2(0, 0);
    }

    get zoom(): number {
        return this._zoom;
    }
    set zoom(zoom: number) {
        this._zoom = zoom;
    }
    get centre(): Vector2 {
        return this._centre;
    }
    set centre(centre: Vector2) {
        this._centre = centre;
    }

    /**
     * @returns the top left corner of the viewport in world coordinates
     */
    top_left(): Vector2 {
        return this._centre.sub(this.half_width_height());
    }

    /**
     * @ returns half the width and height of the viewport in world coordinates
     */
    half_width_height(): Vector2 {
        return new Vector2(this.canvas.width / 2 / this._zoom, this.canvas.height / 2 / this._zoom);
    }


    world_extent(): Rectangle {
        let half_width_height = this.half_width_height();
        return new Rectangle(this._centre.sub(half_width_height), this._centre.add(half_width_height));
    }
}
