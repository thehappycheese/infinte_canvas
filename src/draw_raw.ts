import { CanvasGrid } from "./CanvasGrid";
import { Polygon } from "./Drawable";
import { Vector, Vector2 } from "./geom";
import { pairwise, transpose, wrap } from "./itertools_eager";
import { Viewport } from "./Viewport";

export function draw_raw(ctx: CanvasRenderingContext2D, points: Vector[], last_drawn_point_and_pressure: Vector | null = null) {
    if (points.length > 0) {

        if (last_drawn_point_and_pressure !== null) {
            points = [last_drawn_point_and_pressure, ...points];
        }

        let lineTo = (v: Vector2) => ctx.lineTo(v.x, v.y);

        const size_normal = 30 / 2;
        const size_tangent = 20 / 2;
        const skew_between_normal_and_tangent = 50 / 180 * Math.PI;

        for (let [[x1, y1, pressure_a, tx1, ty1], [x2, y2, pressure_b, tx2, ty2]] of pairwise(points)) {

            let origin_a = new Vector2(x1, y1);
            let origin_b = new Vector2(x2, y2);

            let normal_a = new Vector2(tx1, ty1);
            let normal_b = new Vector2(tx2, ty2);

            let tangent_a = new Vector2(tx1, ty1).rotated(skew_between_normal_and_tangent);
            let tangent_b = new Vector2(tx2, ty2).rotated(skew_between_normal_and_tangent);

            //            b          f
            //        a  /       e  /
            //       /  /       /  /
            //      /  /       /  /
            //     / A--------/B /
            //    /  /       /  /
            //   /  c       /  g
            //  d          h

            let [a,b,c,d] = compute_oblong(origin_a, normal_a, tangent_a, pressure_a, size_normal, size_tangent);
            let [e,f,g,h] = compute_oblong(origin_b, normal_b, tangent_b, pressure_b, size_normal, size_tangent);


            //ctx.fillStyle = "#bf2a64";
            ctx.beginPath();
            lineTo(a);
            lineTo(e);
            lineTo(h);
            lineTo(d);
            ctx.fill();

            //ctx.fillStyle = "#64bf2a";
            ctx.beginPath();
            lineTo(b);
            lineTo(f);
            lineTo(g);
            lineTo(c);
            ctx.fill();

            //ctx.fillStyle = "#2a64bf";
            ctx.beginPath();
            lineTo(a);
            lineTo(b);
            lineTo(f);
            lineTo(e);
            ctx.fill();

            //ctx.fillStyle = "#642abf";
            ctx.beginPath();
            lineTo(d);
            lineTo(c);
            lineTo(g);
            lineTo(h);
            ctx.fill();
        }

        return points[points.length - 1];
    }
    return null;
}

export interface PenTip_Chisel{
    size_normal_px:number;
    size_tangent_px:number;
    skew_between_normal_and_tangent_rad:number;
}

export function draw_raw_polygon(
        ctx: CanvasGrid,
        viewport:Viewport,
        points: Vector[],
        last_drawn_point_and_pressure: Vector | null,
        pen_tip:PenTip_Chisel
    ):Vector|null {
    
    if (last_drawn_point_and_pressure !== null) {
        points = [last_drawn_point_and_pressure, ...points];
    }
    if(points.length > 1) {

        let pen_tip_shapes = points.map(([x, y, pressure, tx, ty]) => {
            let origin = new Vector2(x, y);
            let normal  = new Vector2(tx, ty);
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
        
        let pen_tip_corner_paths = transpose(pen_tip_shapes);

        let polygons = pairwise(wrap(pen_tip_corner_paths)).map(([a,b]) => new Polygon([
            ...a,
            ...b.reverse()
        ]));

        // TODO: errghhhhhhh
        polygons.map(polygon => polygon.transformed(viewport.viewport_to_world.bind(viewport)));

        polygons.forEach(polygon => ctx.draw_polygon(polygon));

        return points[points.length - 1];
    }else{
        return null
    }

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
 * @param size_normal is the size of the pen tip in the normal direction.
 * @param size_tangent is the size of the pen tip in the tangent direction.
 * @returns `abcd` in the above diagram
 */
function compute_oblong(origin:Vector2, normal:Vector2, tangent:Vector2, pressure:number, size_normal:number, size_tangent:number) {
    let a = origin.add(normal.mul(size_normal * pressure));
    let d = origin.sub(normal.mul(size_normal * pressure));
    let b = a.add(tangent.mul(size_tangent * pressure));
    let c = d.add(tangent.mul(size_tangent * pressure));
    return [a,b,c,d];
}
