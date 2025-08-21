import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Title2001Component } from './title-2001.component';

describe('Title2001Component', () => {
  let component: Title2001Component;
  let fixture: ComponentFixture<Title2001Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Title2001Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Title2001Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
