import {Vector} from "./geom";

export class Simplifier {
    queue_length: number;
    points: Vector[] = [];
    min_distance_squared: number;
    max_distance_squared:number;
    smoothing_factor:number;

    constructor({queue_length, min_distance, max_distance, smoothing_factor}: {queue_length: number, min_distance: number, max_distance:number, smoothing_factor: number}) {
        this.queue_length = queue_length;
        this.min_distance_squared = min_distance*min_distance;
        this.max_distance_squared = max_distance*max_distance;
        this.smoothing_factor = smoothing_factor;
    }

    last_point() {
        return this.points[this.points.length - 1];
    }

    add_point(p:Vector) {
        if (this.points.length < 1) {
            this.points.push(p);
        } else {
            // Scaling the z component here to add weight to the pressure sensitivity
            if (this.last_point().distance_squared_to(p) > this.min_distance_squared){
                this.points.push(p);
                this.smooth_points();
            }
        }
    }

    smooth_points(){
        this.interpolate_points();
        this.relax_points();
    }

    interpolate_points() {
        for(let i = 0;i<this.points.length-1;i++){
            let a = this.points[i];
            let b = this.points[i+1];
            let ab = b.sub(a);
            let ab_length_squared = ab.magsq();
            if(ab_length_squared > this.max_distance_squared){
                let insertions:Vector[] = [];
                let ab_length = Math.sqrt(ab_length_squared);
                let ab_unit = ab.div(ab_length);
                let number_of_insertions = Math.floor(ab_length/Math.sqrt(this.max_distance_squared));
                let insertion_spacing = ab_length/number_of_insertions;
                for(let j = 0;j<number_of_insertions;j++){
                    insertions.push(a.add(ab_unit.mul(j*insertion_spacing)));
                }
                this.points.splice(i+1,0,...insertions);
                i+=insertions.length;
            }
        }
    }

    relax_points(){
        // hold first and last points stationary,
        // and apply a relaxation force to the points in between
        // the relaxation force is mediated by this.smoothing_factor
        let forces = [new Vector([0,0,0,0,0])];
        for(let i = 1;i<this.points.length-1;i++){
            let a = this.points[i-1];
            let b = this.points[i];
            let c = this.points[i+1];
            let ba = a.sub(b);
            let bc = c.sub(b);
            forces.push(ba.add(bc).mul(this.smoothing_factor));
        }
        forces.push(new Vector([0,0,0,0,0]));
        for(let i = 0;i<this.points.length;i++){
            this.points[i] = this.points[i].add(forces[i]);
        }
    }

    /**
     * @returns the number of points that are ready to be drawn. A zero or negative number is returned if no points are ready.
     */
    count_ready_items():number {
        return this.points.length - this.queue_length;
    }

    /**
     * @returns return the simplified smoothed points that are ready to be drawn. An empty array if no points are ready.
     */
    get_ready_items():Vector[] {
        // remove and return the first count points from this.points
        // Note, it is ok for negative count to be passed into splice. At least according to MDN.
        return this.points.splice(0, this.count_ready_items());
    }

    get_remaining_and_clear():Vector[] {
        // return the remaining points and clear the queue
        let result = this.points;
        this.points = [];
        return result;
    }

    clear() {
        this.points = [];
    }
}
