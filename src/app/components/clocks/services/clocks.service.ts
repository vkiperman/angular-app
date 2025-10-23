import {
  DestroyRef,
  inject,
  Injectable,
  LOCALE_ID,
  NgZone,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  catchError,
  combineLatest,
  defer,
  map,
  Observable,
  shareReplay,
  timer,
} from 'rxjs';

interface Clock {
  h: string;
  m: string;
  s: string;
  period?: string;
}

function reenterZone<T>(ngZone: NgZone) {
  return (source: Observable<T>) =>
    new Observable<T>((observer) =>
      source.subscribe({
        next: (v) => ngZone.run(() => observer.next(v)),
        error: (e) => ngZone.run(() => observer.error(e)),
        complete: () => ngZone.run(() => observer.complete()),
      }),
    );
}

@Injectable({
  providedIn: 'root',
})
export class ClocksService {
  private destroyRef = inject(DestroyRef);
  private locale = inject(LOCALE_ID);
  public hour12 = signal(false);
  private ngZone = inject(NgZone);

  private tick$ = defer(() =>
    this.ngZone.runOutsideAngular(() => timer(0, 1000)),
  );

  public time$: Observable<Clock> = combineLatest([
    this.tick$,
    toObservable(this.hour12),
  ]).pipe(
    map(() => new Date()),
    map((d) => d.toLocaleTimeString(this.locale, { hour12: this.hour12() })),
    map((t) => t.split(/:| /)),
    map(([h, m, s, period]) => ({ h: h.padStart(2), m, s, period })),
    catchError((error, caught) => {
      console.error('Error in timer observable:', error);
      return caught;
    }),
    takeUntilDestroyed(this.destroyRef),
    reenterZone(this.ngZone),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public decaseconds$ = defer(() =>
    this.ngZone.runOutsideAngular(() => timer(0, 100)),
  ).pipe(map(() => new Date().getMilliseconds()));
}
