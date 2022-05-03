import { Vector, Vector2 } from "./geom";
import { Simplifier } from "./Simplifier";
import { CanvasGrid } from "./CanvasGrid";
import { Viewport } from "./Viewport";
import "./style.css";
import { draw_raw_polygon, PenTip_Chisel } from "./draw_raw";


let pointerdown = false;
let simplifier: Simplifier = new Simplifier({
    queue_length: 10,
    min_distance: 0.1,
    max_distance: 5,
    smoothing_factor: 0.1
});


let canvas_overlay: HTMLCanvasElement = document.querySelector("#overlay") as HTMLCanvasElement;
let canvas_underlay: HTMLCanvasElement = document.querySelector("#underlay") as HTMLCanvasElement;


canvas_underlay.width = canvas_underlay.parentElement.clientWidth;
canvas_underlay.height = canvas_underlay.parentElement.clientHeight;
let viewport = new Viewport(canvas_underlay);
let pen_tip: PenTip_Chisel = {
    size_normal_px: 30 / 2,
    size_tangent_px: 20 / 2,
    skew_between_normal_and_tangent_rad: 50 / 180 * Math.PI
}
let canvas_grid = new CanvasGrid(new Vector2(80, 80));

let ctx_overlay: CanvasRenderingContext2D = configure_canvas(canvas_overlay);

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
    if (pointerdown) return;
    // if (e.pointerType !== "pen")
    //     return;
    pointerdown = true;
    canvas_overlay.setPointerCapture(e.pointerId);
    simplifier.add_point(point_from_pointer_event(e));
    draw();
});

canvas_overlay.addEventListener("pointermove", function (e) {
    e.preventDefault()
    // if (e.pointerType !== "pen")
    //     return;
    if (pointerdown) {
        simplifier.add_point(point_from_pointer_event(e));
        draw();
    }
});

function point_from_pointer_event(e: PointerEvent) {
    return new Vector([
        e.offsetX, e.offsetY,
        e.pressure,//*viewport._zoom,
        project_tilt_from_angle(e.tiltX), project_tilt_from_angle(e.tiltY)
    ]);
}

canvas_overlay.addEventListener("pointerleave", stop_draw);
canvas_overlay.addEventListener("pointerout", stop_draw);
canvas_overlay.addEventListener("pointercancel", stop_draw);
canvas_overlay.addEventListener("pointerup", stop_draw);



function clear_canvas(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function stop_draw(e: PointerEvent) {
    e.preventDefault()
    // if (e.pointerType !== "pen")
    //     return;
    draw_end();
    pointerdown = false;
    canvas_overlay.releasePointerCapture(e.pointerId);
}



let last_drawn_point_and_pressure: [Vector] | [] = [];

function draw() {
    if (simplifier.count_ready_items() + last_drawn_point_and_pressure.length < 2) return;
    let ready_points = [...last_drawn_point_and_pressure, ...simplifier.get_ready_items()];
    last_drawn_point_and_pressure = [ready_points[ready_points.length - 1]];
    draw_raw_polygon(canvas_grid, viewport, ready_points, pen_tip);
    clear_canvas(ctx_overlay);
    if (simplifier.points.length + last_drawn_point_and_pressure.length > 1) {
        draw_raw_polygon(canvas_grid, viewport, simplifier.points, pen_tip);
    }
    // TODO: this render api is bonkers. le fix
    canvas_grid.render_cells_to_viewport(viewport);
}
function draw_end() {
    pointerdown = false;
    let ready_points = [...last_drawn_point_and_pressure, ...simplifier.get_remaining_and_clear()];
    if (ready_points.length < 2) return;
    draw_raw_polygon(canvas_grid, viewport, ready_points, pen_tip);
    last_drawn_point_and_pressure = [];
    clear_canvas(ctx_overlay);
    canvas_grid.render_cells_to_viewport(viewport);
}



window.addEventListener("keydown", function (e: KeyboardEvent) {
    if (e.key === "ArrowLeft") {
        e.preventDefault();
        viewport.translate(new Vector2(-10, 0));
    }
    if (e.key === "ArrowRight") {
        e.preventDefault();
        viewport.translate(new Vector2(10, 0));
    }
    if (e.key === "ArrowUp") {
        e.preventDefault();
        viewport.translate(new Vector2(0, -10));
    }
    if (e.key === "ArrowDown") {
        e.preventDefault();
        viewport.translate(new Vector2(0, 10));
    }
    if (e.key === "PageUp") {
        e.preventDefault();
        viewport.zoom_by(1.1);
    }
    if (e.key === "PageDown") {
        e.preventDefault();
        viewport.zoom_by(1 / 1.1);
    }
    if (e.key === "Home") {
        e.preventDefault();
        viewport.reset_view();
    }
    canvas_grid.render_cells_to_viewport(viewport);
});