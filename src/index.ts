import { Vector, Vector2 } from "./geom";
import { Simplifier } from "./Simplifier";
import { CanvasGrid } from "./CanvasGrid";
import { Viewport } from "./Viewport";
import "./style.css";
import { draw_raw, draw_raw_polygon, PenTip_Chisel } from "./draw_raw";



let pointerdown = false;
let simplifier: Simplifier = new Simplifier({
    queue_length: 10,
    min_distance: 1,
    max_distance: 5,
    smoothing_factor: 0.1
});



let canvas_overlay: HTMLCanvasElement = document.querySelector("#overlay") as HTMLCanvasElement;
let canvas_underlay: HTMLCanvasElement = document.querySelector("#underlay") as HTMLCanvasElement;
let canvas_new_underlay = document.querySelector("#nunderlay") as HTMLCanvasElement;

let viewport = new Viewport(canvas_new_underlay);
let pen_tip:PenTip_Chisel = {
    size_normal_px:  30/2,
    size_tangent_px: 20/2,
    skew_between_normal_and_tangent_rad:50 / 180 * Math.PI
}
let canvas_grid = new CanvasGrid(new Vector2(80, 80));

let ctx_overlay: CanvasRenderingContext2D = configure_canvas(canvas_overlay);
let ctx_underlay: CanvasRenderingContext2D = configure_canvas(canvas_underlay);

function configure_canvas(canvas: HTMLCanvasElement) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    let ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#bf2a64";
    ctx.fillStyle = "#bf2a64";
    ctx.lineCap = "round";
    return ctx
}

let project_tilt_from_angle = (tilt_angle: number) => Math.sin(tilt_angle / 180 * Math.PI);

canvas_overlay.addEventListener("pointerdown", function (e) {
    e.preventDefault()
    if (e.pointerType !== "pen")
        return;
    pointerdown = true;
    canvas_overlay.setPointerCapture(e.pointerId);
    simplifier.add_point(new Vector([e.offsetX, e.offsetY, e.pressure, project_tilt_from_angle(e.tiltX), project_tilt_from_angle(e.tiltY)]));
    draw();
});

canvas_overlay.addEventListener("pointermove", function (e) {
    e.preventDefault()
    if (e.pointerType !== "pen")
        return;
    if (pointerdown) {
        simplifier.add_point(new Vector([e.offsetX, e.offsetY, e.pressure, project_tilt_from_angle(e.tiltX), project_tilt_from_angle(e.tiltY)]));
        draw()

    }
});

canvas_overlay.addEventListener("pointerleave", stop_draw);
canvas_overlay.addEventListener("pointerout", stop_draw);
canvas_overlay.addEventListener("pointercancel", stop_draw);
canvas_overlay.addEventListener("pointerup", stop_draw);



function clear_canvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function stop_draw(e: PointerEvent) {
    e.preventDefault()
    if (e.pointerType !== "pen")
        return;
    draw_end();
    pointerdown = false;
    canvas_overlay.releasePointerCapture(e.pointerId);
}



let last_drawn_point_and_pressure: Vector | null = null;
function draw() {
    let ready_points = simplifier.get_ready_items();
    if (ready_points.length > 0) {
        //last_drawn_point_and_pressure = draw_raw(ctx_underlay, ready_points, last_drawn_point_and_pressure);
        clear_canvas(ctx_overlay);
        draw_raw(ctx_overlay, simplifier.points, last_drawn_point_and_pressure);

        draw_raw_polygon(canvas_grid, viewport, ready_points, last_drawn_point_and_pressure, pen_tip);
    }
    canvas_grid.render_cells_to_viewport(viewport);
}

function draw_end() {
    draw_raw(ctx_underlay, simplifier.points, last_drawn_point_and_pressure);
    simplifier.clear();
    last_drawn_point_and_pressure = null;
    clear_canvas(ctx_overlay);
}



