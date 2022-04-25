import {zip} from "./itertools_eager";

export class Vector{
    d:number[];
    constructor(d:number[]){
        this.d = d;
    }
    get x(){
        return this.d[0];
    }
    get y(){
        return this.d[1];
    }
    get z(){
        return this.d[2];
    }
    get xy(){
        return new Vector2(this.x, this.y);
    }
    add(v:Vector){
        return new Vector(zip(this.d, v.d).map(([a,b])=>a+b));
    }
    sub(v:Vector){
        return new Vector(zip(this.d, v.d).map(([a,b])=>a-b));
    }
    emul(v:Vector){
        return new Vector(zip(this.d, v.d).map(([a,b])=>a*b));
    }
    dot(v:Vector){
        return zip(this.d, v.d).reduce((acc, [a,b])=>acc+a*b,0);
    }
    mul(s:number){
        return new Vector(this.d.map(x => x*s));
    }
    div(s:number){
        return new Vector(this.d.map(x => x/s));
    }

    magsq(){
        return this.d.map(i=>i*i).reduce((a,b)=>a+b);
    }
    mag(){
        return Math.sqrt(this.magsq());
    }

    distance_squared_to(v:Vector){
        return zip(this.d, v.d).reduce((acc,[a,b])=>acc+(a-b)**2, 0);
    }

    unit(){
        return this.div(this.mag());
    }

    [Symbol.iterator](){
        return this.d[Symbol.iterator]();
    }
    // * values(){
    //     yield * this[Symbol.iterator]();
    // }
}




export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * 
     * @returns {Vector2} A downcast vector with the same `x` and `y` values
     */
    xy(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    add(v: Vector3) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    sub(v: Vector3) {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * @param v
     * @returns {Vector2} A new vector which has been element-wise multiplied by `v`
     */
    emul(v: Vector3) {
        return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }


    mul(s: number) {
        return new Vector3(this.x * s, this.y * s, this.z * s);
    }

    /**
     * @returns {number} A new vector which has been element-wise divided by the scalar `s`
     * @throws {DivideByZeroError} if s is zero
     */
    div(s: number) {
        return new Vector3(this.x / s, this.y / s, this.z / s);
    }
    dot(v: Vector3) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    /**
     * @returns {number} Magnitude
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * @returns {number} Magnitude Squared
     */
    magsq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * @param v 
     * @returns distance to another vector `v` squared
     */
    distance_squared_to(v: Vector3) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        let dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * @returns {Vector2} A new normalized vector or "unit vector" which has a magnitude of 1
     * @throws {Error} If magnitude is zero
     */
    unit(): Vector3 {
        let mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        return new Vector3(this.x / mag, this.y / mag, this.z / mag);
    }
}



export class Vector2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    rotated(theta: number) {
        let c = Math.cos(theta);
        let s = Math.sin(theta);
        return new Vector2(this.x * c - this.y * s, this.x * s + this.y * c);
    }

    add(v: Vector2) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    sub(v: Vector2) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }
    mul(s: number) {
        return new Vector2(this.x * s, this.y * s);
    }

    /**
     * @returns {number} A new vector composed of the element-wise minimum of each component
     */
    emin(v: Vector2) {
        return new Vector2(Math.min(this.x, v.x), Math.min(this.y, v.y));
    }

    /**
     * @returns {number} A new vector composed of the element-wise maximum of each component
     */
    emax(v: Vector2) {
        return new Vector2(Math.max(this.x, v.x), Math.max(this.y, v.y));
    }
    
    /**
     * @returns {number} A new vector which has been element-wise divided by the scalar `s`
     * @throws {DivideByZeroError} if s is zero
     */
    div(s: number) {
        return new Vector2(this.x / s, this.y / s);
    }
    dot(v: Vector2) {
        return this.x * v.x + this.y * v.y;
    }
    /**
     * @returns {number} Magnitude
     */
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * @returns {number} Magnitude Squared
     */
    magsq() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * @param v 
     * @returns distance to another vector `v` squared
     */
    distance_squared_to(v: Vector2) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        return dx * dx + dy * dy;
    }

    /**
     * @returns {Vector2} A new normalized vector or "unit vector" which has a magnitude of 1
     * @throws {Error} If magnitude is zero
     */
    unit(): Vector2 {
        let mag = Math.sqrt(this.x * this.x + this.y * this.y);
        return new Vector2(this.x / mag, this.y / mag);
    }

    [Symbol.iterator](){
        return [this.x, this.y][Symbol.iterator]();
    }
}


export function project_point_onto_line(a: Vector2, b: Vector2, p: Vector2) {
    let ab = b.sub(a);
    let ap = p.sub(a);
    let t = ab.dot(ap) / ab.magsq();
    return a.add(ab.mul(t));
}

export function project_point_onto_segment(a: Vector2, b: Vector2, p: Vector2) {
    let ab = b.sub(a);
    let ap = p.sub(a);
    let t = ab.dot(ap) / ab.magsq();
    if (t < 0) {
        return a;
    }
    if (t > 1) {
        return b;
    }
    return a.add(ab.mul(t));
}


export function hit_test_point(points: Vector2[], point: Vector2, tolerance: number = 5) {
    let tolerance_sq = tolerance * tolerance;
    return points.findIndex(p => p.sub(point).magsq() < tolerance_sq);
}

export function hit_test_edge(points: Vector2[], point: Vector2, tolerance: number = 3) {
    let tolerance_sq = tolerance * tolerance;
    for (let i = 0; i < points.length - 1; i++) {
        let a = points[i];
        let b = points[i + 1];
        let c = project_point_onto_segment(a, b, point);

        if (c.sub(point).magsq() < tolerance_sq) {
            return i;
        }
    }
    return -1;
}

function interval_distance(a_from: number, a_to: number, b_from: number, b_to: number) {
    return Math.min(a_to, b_to) - Math.max(a_from, b_from);
}


export class Rectangle {
    
    top_left: Vector2;
    bottom_right: Vector2;

    constructor(top_left: Vector2, bottom_right: Vector2) {
        this.top_left = top_left;
        this.bottom_right = bottom_right;
    }

    interval_distance(b: Rectangle) {
        let overlap_x = interval_distance(this.top_left.x, this.bottom_right.x, b.top_left.x, b.bottom_right.x);
        let overlap_y = interval_distance(this.top_left.y, this.bottom_right.y, b.top_left.y, b.bottom_right.y);
        return new Vector2(overlap_x, overlap_y);
    }

    overlaps(other: Rectangle) {
        let id = this.interval_distance(other);
        return id.x > 0 && id.y > 0;
    }

    union(other: Rectangle) {
        let tl = new Vector2(
            Math.min(this.top_left.x, other.top_left.x),
            Math.min(this.top_left.y, other.top_left.y)
        );
        let br = new Vector2(Math.max(this.bottom_right.x, other.bottom_right.x), Math.max(this.bottom_right.y, other.bottom_right.y));
        return new Rectangle(tl, br);
    }

    padded(padding: Vector2) {
        return new Rectangle(
            this.top_left    .sub(new Vector2(padding.x, padding.y)),
            this.bottom_right.add(new Vector2(padding.x, padding.y))
        );
    }


}