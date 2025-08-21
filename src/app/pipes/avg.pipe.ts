import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avg',
})
export class AvgPipe<T> implements PipeTransform {
  public transform(value: (number | T)[], prop?: keyof T): number {
    return value
      .map((o) => (prop ? (o as T)[prop] : o) as number)
      .reduce(
        (acc, cur, i, src) =>
          src.length - 1 <= i ? (acc + cur) / (i + 1) : acc + cur,
        0,
      );
  }
}
