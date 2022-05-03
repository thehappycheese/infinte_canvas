import { CanvasGrid } from "./CanvasGrid";
import { Polygon } from "./Drawable";
import { Vector, Vector2 } from "./geom";
import { forwards_backwards, pairwise, transpose, wrap } from "./itertools_eager";
import { Viewport } from "./Viewport";

export interface PenTip_Chisel{
    size_normal_px:number;
    size_tangent_px:number;
    skew_between_normal_and_tangent_rad:number;
}

export function draw_raw_polygon(
        ctx: CanvasGrid,
        viewport:Viewport,
        points_viewport: Vector[],
        pen_tip:PenTip_Chisel
    ){
    
    if(points_viewport.length < 2)
        throw new Error("At least two points are required to draw a polygon");

    let pen_tip_shapes = points_viewport.map(([x, y, pressure, tx, ty]) => {
        let origin = new Vector2( x,  y);
        let normal = new Vector2(tx, ty);
        // TODO: optimize this next line to 90 deg rotation
        let tangent = normal.rotated(pen_tip.skew_between_normal_and_tangent_rad);
        return compute_oblong(
            origin,
            normal,
            tangent,
            pressure,
            pen_tip.size_normal_px,
            pen_tip.size_tangent_px
        );
    })

    //pen_tip_shapes.forEach((points) => points.forEach(point => ctx.draw_point(point)))
    
    let polygons_viewport = forwards_backwards(pairwise(wrap(transpose(pen_tip_shapes)))).map(points => new Polygon(points));

    let polygons_world = polygons_viewport.map(polygon => polygon.transformed(point=>viewport.viewport_to_world(point)));

    polygons_world.forEach(polygon => ctx.draw_polygon(polygon));

}

/**
 * The rectangle `abcd` in the diagram below is the shape of the pen tip.
 * `A` and `B` represent the position of the pen now and in some future frame.
 * 
 * Given the `origin` (`A`), `normal` and `tangent` vectors, compute_oblong will return abcd
 * The normal and tangent vectors can be any two basis vectors really, but typically 
 * we might use the pen tilt and its perpendicular for these values.
 * If the pen tip shape is fixed in the direction of travel then we might use the vector `AB` as `tangent`.
 * 
 * ```text
 *            b          f
 *        a  /       e  /
 *       /  /       /  /
 *      /  /       /  /
 *     / A--------/B /
 *    /  /       /  /
 *   /  c       /  g
 *  d          h
 * ```
 * 
 * @param origin the origin `A` in the above diagram
 * @param normal
 * @param tangent 
 * @param pressure is used to scale the pen tip
 * @param radius_normal is half the size of the pen tip in the normal direction.
 * @param radius_tangent is half the size of the pen tip in the tangent direction.
 * @returns `abcd` in the above diagram, where A---B represents the movement of the pen tip, and abcd are the corners of the pen shape at point A.
 */
function compute_oblong(origin:Vector2, normal:Vector2, tangent:Vector2, pressure:number, radius_normal:number, radius_tangent:number) {
    let norm = normal.mul(radius_normal * pressure);
    let tang = tangent.mul(radius_tangent * pressure);
    let a = origin.add(norm);
    let d = origin.sub(norm);
    let b = a.add(tang);
    let c = d.add(tang);
    return [a,b,c,d];
}
