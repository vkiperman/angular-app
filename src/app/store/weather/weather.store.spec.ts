import { TestBed } from '@angular/core/testing';

import { WeatherStore } from './weather.store';

describe('WeatherStore', () => {
  let service: WeatherStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeatherStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
