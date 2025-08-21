import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { weatherApiActions } from './weather.actions';
import { Weather } from './weather.reducer';

@Injectable({
  providedIn: 'root',
})
export class WeatherStore {
  constructor(private store: Store<Weather>) {}

  public getForecast(latitude: number, longitude: number) {
    this.store.dispatch(
      weatherApiActions.forecastRequest({
        latitude,
        longitude,
      }),
    );
  }

  public selectForecast() {
    return this.store.select(({ weather }: any) => {
      return weather.forecast;
    });
  }
}
