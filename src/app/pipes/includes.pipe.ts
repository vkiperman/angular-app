import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes',
})
export class IncludesPipe implements PipeTransform {
  public transform(value: string | string[], arg: string): boolean {
    return value.includes(arg);
  }
}
