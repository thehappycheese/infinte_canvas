
export function * pairwise<T>(gen:IterableIterator<T>): IterableIterator<[T, T]> {
    let a = gen.next();
    let b = gen.next();
    while (!a.done && !b.done) {
        yield [a.value, b.value];
        a = gen.next();
        b = gen.next();
    }
}

export function * zip<T>(...gens: IterableIterator<T>[]): IterableIterator<T[]> {
    while(true){
        let values: T[] = [];
        for(let gen of gens){
            let value = gen.next();
            if(value.done){
                return;
            }
            values.push(value.value);
        }
        yield values;
    }
}

export function * enumerate<T>(gen: IterableIterator<T>): IterableIterator<[number, T]> {
    let cnt = 0;
    while(true){
        let value = gen.next();
        if(value.done){
            return;
        }
        yield [cnt++, value.value];
    }
}

export function * map<A,B>(f: (x:A)=>B, gen: IterableIterator<A>): IterableIterator<B> {
    while(true){
        let value = gen.next();
        if(value.done){
            return;
        }else{
            yield f(value.value);
        }
    }
}

export function * sum (items:IterableIterator<number>) {
    let sum = 0;
    while(true){
        let value = items.next();
        if(value.done){
            return sum;
        }
        sum += value.value;
    }
}