import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightTrackerComponent } from './weight-tracker.component';

describe('WeightTrackerComponent', () => {
  let component: WeightTrackerComponent;
  let fixture: ComponentFixture<WeightTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeightTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeightTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
