import { Pipe, PipeTransform } from '@angular/core';
import { Observable, concatMap, delay, from, of } from 'rxjs';
import { Team } from '../logos.component';

@Pipe({
  name: 'step',
})
export class StepPipe implements PipeTransform {
  public transform(
    team: string,
    teams: Team[],
    rate = 1000,
  ): Observable<number> {
    if (!team) return from([]);
    const { from: fr, to } = teams.find(({ value }) => value === team)!;

    const source$ = from([...Array(to - fr + 1).keys()].map((n) => n + fr));
    return source$.pipe(concatMap((value) => of(value).pipe(delay(rate))));
  }
}
