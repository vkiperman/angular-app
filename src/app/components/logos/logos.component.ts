import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  map,
  Observable,
  of,
  startWith,
  tap,
} from 'rxjs';
import { MaxYearPipe } from './pipes/max-year.pipe';
import { MinYearPipe } from './pipes/min-year.pipe';
import { RangePipe } from './pipes/range.pipe';
import { StepPipe } from './pipes/step.pipe';

export interface Team {
  value: string;
  label: string;
  from: number;
  to: number;
}
@Component({
  selector: 'logos',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaxYearPipe,
    MinYearPipe,
    RangePipe,
    StepPipe,
  ],
  templateUrl: './logos.component.html',
  styleUrl: './logos.component.scss',
})
export class LogosComponent implements OnInit {
  public teams = [
    { value: 'crd', label: 'Arizona Cardinals', from: 1920, to: 2025 },
    { value: 'atl', label: 'Atlanta Falcons', from: 1966, to: 2025 },
    { value: 'rav', label: 'Baltimore Ravens', from: 1996, to: 2025 },
    { value: 'buf', label: 'Buffalo Bills', from: 1960, to: 2025 },
    { value: 'car', label: 'Carolina Panthers', from: 1995, to: 2025 },
    { value: 'chi', label: 'Chicago Bears', from: 1920, to: 2025 },
    { value: 'cin', label: 'Cincinnati Bengals', from: 1968, to: 2025 },
    { value: 'cle', label: 'Cleveland Browns', from: 1946, to: 2025 },
    { value: 'dal', label: 'Dallas Cowboys', from: 1960, to: 2025 },
    { value: 'den', label: 'Denver Broncos', from: 1960, to: 2025 },
    { value: 'det', label: 'Detroit Lions', from: 1930, to: 2025 },
    { value: 'gnb', label: 'Green Bay Packers', from: 1921, to: 2025 },
    { value: 'htx', label: 'Houston Texans', from: 2002, to: 2025 },
    { value: 'clt', label: 'Indianapolis Colts', from: 1953, to: 2025 },
    { value: 'jax', label: 'Jacksonville Jaguars', from: 1995, to: 2025 },
    { value: 'kan', label: 'Kansas City Chiefs', from: 1960, to: 2025 },
    { value: 'rai', label: 'Las Vegas Raiders', from: 1960, to: 2025 },
    { value: 'sdg', label: 'Los Angeles Chargers', from: 1960, to: 2025 },
    { value: 'ram', label: 'Los Angeles Rams', from: 1937, to: 2025 },
    { value: 'mia', label: 'Miami Dolphins', from: 1966, to: 2025 },
    { value: 'min', label: 'Minnesota Vikings', from: 1961, to: 2025 },
    { value: 'nwe', label: 'New England Patriots', from: 1960, to: 2025 },
    { value: 'nor', label: 'New Orleans Saints', from: 1967, to: 2025 },
    { value: 'nyg', label: 'New York Giants', from: 1925, to: 2025 },
    { value: 'nyj', label: 'New York Jets', from: 1960, to: 2025 },
    { value: 'phi', label: 'Philadelphia Eagles', from: 1933, to: 2025 },
    { value: 'pit', label: 'Pittsburgh Steelers', from: 1933, to: 2025 },
    { value: 'sfo', label: 'San Francisco 49ers', from: 1946, to: 2025 },
    { value: 'sea', label: 'Seattle Seahawks', from: 1976, to: 2025 },
    { value: 'tam', label: 'Tampa Bay Buccaneers', from: 1976, to: 2025 },
    { value: 'oti', label: 'Tennessee Titans', from: 1960, to: 2025 },
    { value: 'was', label: 'Washington Commanders', from: 1932, to: 2025 },
  ];

  public maxYear = new Date().getFullYear();

  public searchForm = new FormGroup({
    team: new FormControl<string>(''),
    year: new FormControl<number | null>(null),
  });

  public searchForm$!: Observable<{
    team?: string | null;
    year?: number | null;
  }>;

  public get range() {
    const team = this.searchForm.value.team!;
    if (!team) return [];
    const { from, to } = this.teams.find(({ value }) => value === team)!;
    return [...Array(to - from + 1).keys()].map((n) => n + from);
  }

  public ngOnInit(): void {
    const searchForm$ = this.searchForm.valueChanges.pipe(
      debounceTime(555),
      startWith(this.searchForm.value),
    );

    const team$ =
      this.searchForm.get('team')?.valueChanges.pipe(
        tap(() =>
          this.searchForm.get('year')?.setValue(null, { emitEvent: false }),
        ),
        startWith(this.searchForm.value.team),
      ) || of(0);

    this.searchForm$ = combineLatest([searchForm$, team$]).pipe(
      map(([searchForm]) => searchForm),
    );
  }

  // public getRange(team: string) {
  //   if (!team) return [];
  //   const { from, to } = this.teams.find(({ value }) => value === team)!;
  //   return [...Array(to - from + 1).keys()].map((n) => n + from);
  // }

  public checkImage(team: string) {
    return (e: Event) => {
      const target = e.target as HTMLImageElement;
      e.stopPropagation();
      e.preventDefault();
      e.stopImmediatePropagation();

      if ((target as any).width === 1) {
        const p = target.parentNode as HTMLDivElement;
        p.innerHTML =
          this.teams.find((t) => t.value === team)?.label +
          '<br>Logo unavailable';
        // target.remove();
        // (target as any).src =
        //   `https://cdn.ssref.net/req/202508011/tlogo/pfr/${team}-${new Date().getFullYear()}.png`;
      }
    };
  }
}
