import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DotClockComponent } from './dot-clock.component';

describe('DotClockComponent', () => {
  let component: DotClockComponent;
  let fixture: ComponentFixture<DotClockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DotClockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DotClockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
