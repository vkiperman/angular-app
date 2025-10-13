import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicRangeInputComponent } from './dynamic-range-input.component';

describe('DynamicRangeInputComponent', () => {
  let component: DynamicRangeInputComponent;
  let fixture: ComponentFixture<DynamicRangeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicRangeInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicRangeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
