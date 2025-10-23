import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ClocksService } from '../../services/clocks.service';
import { BlinkComponent } from './components/blink/blink.component';
import { DigitComponent } from './components/digit/digit.component';
import { SubSecondsComponent } from './components/sub-seconds/sub-seconds.component';

@Component({
  selector: 'speedometer',
  imports: [CommonModule, DigitComponent, BlinkComponent, SubSecondsComponent],
  templateUrl: './speedometer.component.html',
  styleUrl: './speedometer.component.scss',
})
export class SpeedometerComponent {
  public time$ = inject(ClocksService).time$;
}
