import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'high',
})
export class HighPipe<T> implements PipeTransform {
  public transform(value: (number | T)[], prop?: keyof T): number {
    return value
      .map((o) => (prop ? (o as T)[prop] : o) as number)
      .reduce((acc, cur) => Math.max(acc, cur), 0);
  }
}
