import { Pipe, PipeTransform } from '@angular/core';
import { Team } from '../logos.component';

@Pipe({
  name: 'minYear',
})
export class MinYearPipe implements PipeTransform {
  public transform(teams: Team[], team?: string): number {
    let from = 0;
    if (team) {
      from = teams.find(({ value }: Team) => value === team)?.from || 0;
    }
    return (
      from ||
      teams.reduce(
        (acc, { from }) => Math.min(acc, from),
        new Date().getFullYear(),
      )
    );
  }
}
