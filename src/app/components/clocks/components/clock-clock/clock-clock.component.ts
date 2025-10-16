import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ClocksService } from '../../services/clocks.service';
import { DigitComponent } from './components/digit/digit.component';

@Component({
  selector: 'clock-clock',
  imports: [CommonModule, DigitComponent],
  templateUrl: './clock-clock.component.html',
  styleUrl: './clock-clock.component.scss',
})
export class ClockClockComponent {
  public time$ = inject(ClocksService).time$;
}
