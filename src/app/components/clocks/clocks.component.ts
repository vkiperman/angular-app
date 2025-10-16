import { Component } from '@angular/core';

import { ClockClockComponent } from './components/clock-clock/clock-clock.component';
import { DigitalClockComponent } from './components/digital-clock/digital-clock.component';
import { DotClockComponent } from './components/dot-clock/dot-clock.component';

@Component({
  selector: 'clocks',
  imports: [DotClockComponent, ClockClockComponent, DigitalClockComponent],
  templateUrl: './clocks.component.html',
  styleUrl: './clocks.component.scss',
})
export class ClocksComponent {}
