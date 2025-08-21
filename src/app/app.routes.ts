import { Routes } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LogosComponent } from './components/logos/logos.component';
import { SpotifyComponent } from './components/spotify/spotify.component';
import { TypographyComponent } from './components/typography/typography.component';
import { WeatherComponent } from './components/weather/weather.component';
import { WeightTrackerComponent } from './components/weight-tracker/weight-tracker.component';

export const routes: Routes = [
  {
    path: 'calendar',
    component: CalendarComponent,
  },
  {
    path: 'weather',
    component: WeatherComponent,
  },
  {
    path: 'typography',
    component: TypographyComponent,
  },
  {
    path: 'weight-tracker',
    component: WeightTrackerComponent,
  },
  {
    path: 'spotify',
    component: SpotifyComponent,
  },
  {
    path: 'logos',
    component: LogosComponent,
  },
];
