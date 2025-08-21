import { TestBed } from '@angular/core/testing';

import { WeightTrackerConfigStore } from './weight-tracker-config.store';

describe('WeightTrackerConfigStore', () => {
  let service: WeightTrackerConfigStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeightTrackerConfigStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
