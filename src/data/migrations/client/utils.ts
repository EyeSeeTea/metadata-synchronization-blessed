import _ from "lodash";
import { Ref } from "../../../domain/common/entities/Ref";

export function getDuplicatedIds<Obj extends Ref>(objects: Obj[]): string[] {
    return _(objects)
        .map(obj => obj.id)
        .countBy()
        .pickBy(count => count > 1)
        .keys()
        .value();
}

export function zeroPad(num: number, places: number) {
    const zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

export function enumerate<T>(xs: T[]): Array<[number, T]> {
    return xs.map((x, idx) => [idx, x]);
}
