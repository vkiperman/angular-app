import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import {
  weightTrackerConfigFeatureKey,
  weightTrackerConfigReducer,
} from './components/weight-tracker/store/weight-tracker-config.reducer';
import { WeatherEffects } from './store/weather/weather.effects';
import {
  weatherFeatureKey,
  weatherReducer,
} from './store/weather/weather.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    { provide: LOCALE_ID, useValue: 'en-US' },
    provideStore({
      [weightTrackerConfigFeatureKey]: weightTrackerConfigReducer,
      [weatherFeatureKey]: weatherReducer,
    }),
    provideEffects(WeatherEffects),
    provideRouterStore(),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideHttpClient(withFetch()),
  ],
};
