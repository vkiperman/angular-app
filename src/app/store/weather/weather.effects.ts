import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { weatherApiActions } from './weather.actions';
import { WeatherService } from './weather.service';

@Injectable()
export class WeatherEffects {
  private actions$ = inject(Actions);
  private service = inject(WeatherService);

  public readonly loadWeather$ = createEffect(() =>
    this.actions$.pipe(
      ofType(weatherApiActions.forecastRequest),
      switchMap(({ latitude, longitude }) =>
        this.service.getWeatherData(latitude, longitude),
      ),
      map((forecast) => weatherApiActions.forecastComplete({ forecast })),
    ),
  );
}
