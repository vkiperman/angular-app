import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'low',
})
export class LowPipe<T> implements PipeTransform {
  public transform(value: (number | T)[], prop?: keyof T): number {
    return value
      .map((o) => (prop ? (o as T)[prop] : o) as number)
      .reduce((acc, cur, i) => (i ? Math.min(acc, cur) : cur), 0);
  }
}
