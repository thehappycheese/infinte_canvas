import { Polygon } from "./Drawable";
import { Rectangle, Vector2 } from "./geom";
import { Viewport } from "./Viewport";
import { GridBitmap } from "./GridBitmap";





export class CanvasGrid {
    bitmaps: {[key:string]:GridBitmap};
    cell_size: Vector2;
    constructor(cell_size: Vector2) {
        this.bitmaps = {};
        this.cell_size = cell_size;
    }
    render_cells_to_viewport(viewport: Viewport) {
        let bitmaps_to_draw = this.get_cells_overlapping_rectangle(viewport.world_extent());
        for (let [key, bitmap] of Object.entries(this.bitmaps)) {
            viewport.ctx.drawImage(bitmap.canvas, bitmap.position.x, bitmap.position.y);
        }
    }

    get_cells_overlapping_rectangle(rect: Rectangle) {
        // compute the gird cells that are within rect
        let cell_region = new Rectangle(
            rect.top_left.ediv(this.cell_size).emap(Math.floor),
            rect.bottom_right.ediv(this.cell_size).emap(Math.ceil),
        );
        debugger
        let bitmaps = [];
        for(let cx = rect.top_left.x; cx < cell_region.bottom_right.x; cx++){
            for(let cy = rect.top_left.y; cy < cell_region.bottom_right.y; cy++){
                let key = `${cx},${cy}`;
                if(!(key in this.bitmaps)){
                    this.bitmaps[key] = new GridBitmap(
                        new Vector2(cx, cy).emul(this.cell_size),
                        this.cell_size,
                    );
                }
                bitmaps.push(this.bitmaps[key]);
            }
        }
        return bitmaps;
    }
    /**
     *
     * @param polygon A polygon to render, given in world coordinates
     */
    draw_polygon(polygon_world: Polygon) {
        let polygon_bounds = polygon_world.bounding_rectangle().padded(this.cell_size);
        let bitmaps_to_draw = this.get_cells_overlapping_rectangle(polygon_bounds);
        for (let bitmap of bitmaps_to_draw) {
            let polygon_local = polygon_world.transformed(p => bitmap.world_to_local(p));
            polygon_local.draw(bitmap.ctx);
        }
    }

}
