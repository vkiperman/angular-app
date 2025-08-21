import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { Action } from '@ngrx/store';
import { WeatherEffects } from './weather.effects';

describe('WeatherEffects', () => {
  let actions$: Observable<Action>;
  let effects: WeatherEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WeatherEffects, provideMockActions(() => actions$)],
    });

    effects = TestBed.inject(WeatherEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
