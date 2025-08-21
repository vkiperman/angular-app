import { inject, InjectionToken } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Action, createReducer, on } from '@ngrx/store';
import { ForecastProperties, Points } from '../../types/weather.types';
import { weatherApiActions } from './weather.actions';

export const weatherFeatureKey = 'weather';

export interface Weather {
  forecast: Points<ForecastProperties> | null;
}

export const initialState: Weather = {
  forecast: null,
};

const reducer = createReducer(
  initialState,
  on(weatherApiActions.forecastComplete, (state, { forecast }) => ({
    ...state,
    forecast,
  })),
);

export function weatherReducer(state: Weather | undefined, action: Action) {
  return reducer(state, action);
}

const WEATHER_STATE = new InjectionToken<Weather>(weatherFeatureKey, {
  factory: () => initialState,
});

export const WeatherSignalStore = signalStore(
  { providedIn: 'root' },
  withState(() => inject(WEATHER_STATE)),
  withComputed(({ forecast }) => ({
    forecast: () => forecast(),
  })),
  withMethods((store) => ({
    updateForecast: (forecast: Weather['forecast']) => {
      patchState(store, (state) => ({ ...state, forecast }));
    },
  })),
);
