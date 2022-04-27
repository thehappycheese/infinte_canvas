import { Rectangle, Vector2 } from "./geom";


export interface Drawable {
    draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void;
    bounding_rectangle(): Rectangle;
    transformed(transformation: (points: Vector2) => Vector2): Drawable;
}

export class Polygon implements Drawable{
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