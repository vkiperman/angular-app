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
    title: 'Calendar',
    component: CalendarComponent,
  },
  {
    path: 'weather',
    title: 'Weather',
    component: WeatherComponent,
  },
  {
    path: 'typography',
    title: 'Typography',
    component: TypographyComponent,
  },
  {
    path: 'weight-tracker',
    title: 'Weight Tracker',
    component: WeightTrackerComponent,
  },
  {
    path: 'spotify',
    title: 'Spotify',
    component: SpotifyComponent,
  },
  {
    path: 'logos',
    title: 'Logos',
    component: LogosComponent,
  },
];
