import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubSecondsComponent } from './sub-seconds.component';

describe('SubSecondsComponent', () => {
  let component: SubSecondsComponent;
  let fixture: ComponentFixture<SubSecondsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubSecondsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubSecondsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
