import {
  DestroyRef,
  inject,
  Injectable,
  LOCALE_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, timer } from 'rxjs';

interface Clock {
  h: string;
  m: string;
  s: string;
  period?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClocksService {
  private destroyRef = inject(DestroyRef);
  private locale = inject(LOCALE_ID);
  public time$: Observable<Clock> = timer(0, 1000).pipe(
    map(() => new Date()),
    map((d) => d.toLocaleTimeString(this.locale, { hour12: this.hour12() })),
    map((t) => {
      const [h, m, s, period] = t.split(/:| /);
      return { h: h.padStart(2), m, s, period };
    }),
    catchError((error, caught) => {
      console.error('Error in timer observable:', error);
      return caught;
    }),
    takeUntilDestroyed(this.destroyRef),
  );

  public hour12 = signal(false);
}
