import { Pipe, PipeTransform } from '@angular/core';
import { Team } from '../logos.component';

@Pipe({
  name: 'maxYear',
})
export class MaxYearPipe implements PipeTransform {
  public transform(teams: Team[], team?: string): number {
    let to = 0;
    if (team) {
      to = teams.find(({ value }: Team) => value === team)?.to || to;
    }
    return to || teams.reduce((acc, { to }) => Math.max(acc, to), 0);
  }
}
