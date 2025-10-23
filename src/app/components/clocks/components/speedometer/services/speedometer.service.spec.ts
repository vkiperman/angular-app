import { TestBed } from '@angular/core/testing';

import { SpeedometerService } from './speedometer.service';

describe('SpeedometerService', () => {
  let service: SpeedometerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeedometerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
