import { createActionGroup, props } from '@ngrx/store';
import { Weather } from './weather.reducer';

export const weatherApiActions = createActionGroup({
  source: 'Weather API',
  events: {
    'Forecast Request': props<{ latitude: number; longitude: number }>(),
    'Forecast Complete': props<{ forecast: Weather['forecast'] }>(),
  },
});
