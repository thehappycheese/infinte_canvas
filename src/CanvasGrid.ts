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
        viewport.ctx.clearRect(0, 0, viewport.ctx.canvas.width, viewport.ctx.canvas.height);
        viewport.ctx.save()
        viewport.ctx.scale(viewport.zoom, viewport.zoom);
        viewport.ctx.translate(-viewport._centre.x, -viewport.centre.y);
        for (let [key, bitmap] of Object.entries(this.bitmaps)) {
            viewport.ctx.drawImage(bitmap.canvas, bitmap.position.x, bitmap.position.y);
        }
        viewport.ctx.restore();
    }

    grid_cell_indices_overlapping_rectangle(rectangle_world: Rectangle) {
        // compute the grid cells that are within rect
        return new Rectangle(
            rectangle_world.top_left    .ediv(this.cell_size).emap(Math.floor),
            rectangle_world.bottom_right.ediv(this.cell_size).emap(Math.ceil ),
        );
    }

    /**
     * 
     * @param rectangle_world a `Rectangle` in world coordinates,
     * @returns the `GridBitmap`s that overlap the given rectangle, creating them if they dont exist
     */
    create_cells_overlapping_rectangle(rectangle_world: Rectangle):GridBitmap[] {
        let cell_region = this.grid_cell_indices_overlapping_rectangle(rectangle_world);
        let result:GridBitmap[] = [];
        for(let cx = cell_region.top_left.x; cx < cell_region.bottom_right.x; cx++){
            for(let cy = cell_region.top_left.y; cy < cell_region.bottom_right.y; cy++){
                let key = `${cx},${cy}`;
                if(!(key in this.bitmaps)){
                    this.bitmaps[key] = new GridBitmap(
                        new Vector2(cx, cy).emul(this.cell_size),
                        this.cell_size,
                    );
                }
                result.push(this.bitmaps[key]);
            }
        }
        return result;
    }

    /**
     * 
     * @param rectangle_world a `Rectangle` in world coordinates,
     * @returns The `GridBitmap`s that overlap the given rectangle
     */
    get_cells_overlapping_rectangle(rectangle_world: Rectangle) {
        let cell_region = this.grid_cell_indices_overlapping_rectangle(rectangle_world);
        let result:GridBitmap[] = [];
        for(let cx = cell_region.top_left.x; cx < cell_region.bottom_right.x; cx++){
            for(let cy = cell_region.top_left.y; cy < cell_region.bottom_right.y; cy++){
                let key = `${cx},${cy}`;
                if(key in this.bitmaps) result.push(this.bitmaps[key]);
            }
        }
        return result;
    }

    /**
     *
     * @param polygon A polygon to render, given in world coordinates
     */
    draw_polygon(polygon_world: Polygon) {
        let bitmaps_to_draw = this.create_cells_overlapping_rectangle(
            polygon_world
            .bounding_rectangle()
            .padded(new Vector2(1,1))
        );
        for (let bitmap of bitmaps_to_draw) {
            let polygon_local = polygon_world.transformed(p => bitmap.world_to_local(p));
            //let polygon_local = rect.transformed(p => bitmap.world_to_local(p));
            polygon_local.draw(bitmap.ctx);
        }
    }

    draw_point(point: Vector2) {
        let bitmaps = this.get_cells_overlapping_rectangle(new Rectangle(
            point.sub(new Vector2(0.5,0.5)),
            point.add(new Vector2(0.5,0.5)),
        ));
        for (let bitmap of bitmaps) {
            bitmap.ctx.fillStyle = "red";
            let transformed_point = bitmap.world_to_local(point);
            bitmap.ctx.fillRect(
                transformed_point.x - 0.5,
                transformed_point.y - 0.5,
                1,
                1,
            );
        }
    }

}
