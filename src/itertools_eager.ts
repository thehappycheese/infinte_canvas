
export function pairwise<T>(arr:T[]): [T,T][] {
    let result:[T,T][] = [];
    for(let i = 0; i < arr.length - 1; i++){
        result.push([arr[i], arr[i+1]]);
    }
    return result
}

export function zip<T>(...arrs: T[][]): T[][] {
    let length = arrs.reduce((a, b) => Math.min(a, b.length), Infinity);
    let result: T[][] = [];
    for (let i = 0; i < length; i++) {
        result.push(arrs.map(arr => arr[i]));
    }
    return result;
}

export function transpose<T>(arr:T[][]): T[][] {
    let result:T[][] = [];
    for(let i = 0; i < arr[0].length; i++){
        result.push(arr.map(row => row[i]));
    }
    return result;
}

/**
 * 
 * @param arr any array
 * @returns the same as the input array except the first element is repeated once more after the last element.
 */
export function wrap<T>(arr:T[]):T[]{
    return [...arr, arr[0]];
}