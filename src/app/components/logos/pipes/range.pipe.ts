import { Pipe, PipeTransform } from '@angular/core';
import { delay, Observable, of, startWith } from 'rxjs';
import { Team } from '../logos.component';

@Pipe({
  name: 'range',
})
export class RangePipe implements PipeTransform {
  public transform(team: string, teams: Team[]): Observable<number[]> {
    if (!team) return of([]);
    const { from, to } = teams.find(({ value }) => value === team)!;

    return of([...Array(to - from + 1).keys()].map((n) => n + from)).pipe(
      delay(1),
      startWith([]),
    );
  }
}
