import { Vector, Vector2 } from "./geom";
import { pairwise } from "./itertools_eager";

export function draw_raw(ctx: CanvasRenderingContext2D, points: Vector[], last_drawn_point_and_pressure: Vector | null = null) {
    if (points.length > 0) {

        if (last_drawn_point_and_pressure !== null) {
            points = [last_drawn_point_and_pressure, ...points];
        }

        let lineTo = (v: Vector2) => ctx.lineTo(v.x, v.y);

        for (let [[x1, y1, pressure_a, tx1, ty1], [x2, y2, pressure_b, tx2, ty2]] of pairwise(points)) {


            /**
             * Size Normal / 2
             */
            const size_normal = 30 / 2;

            /**
             * Size Tangent / 2
             */
            const size_tangent = 20 / 2;

            /**
             * Skew between normal and tangent
             */
            const skew_between_normal_and_tangent = 50 / 180 * Math.PI;

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



//            b          f
//        a  /       e  /
//       /  /       /  /
//      /  /       /  /
//     / A--------/B /
//    /  /       /  /
//   /  c       /  g
//  d          h
function compute_oblong(origin:Vector2, normal:Vector2, tangent:Vector2, pressure:number, size_normal:number, size_tangent:number) {
    let a = origin.add(normal.mul(size_normal * pressure));
    let d = origin.sub(normal.mul(size_normal * pressure));
    let b = a.add(tangent.mul(size_tangent * pressure));
    let c = d.add(tangent.mul(size_tangent * pressure));
    return [a,b,c,d];
}
