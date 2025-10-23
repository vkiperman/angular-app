import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ClocksService } from '../../services/clocks.service';
import { BlinkComponent } from './components/blink/blink.component';
import { DigitComponent } from './components/digit/digit.component';
import { SubSecondsComponent } from './components/sub-seconds/sub-seconds.component';
import { SpeedometerService } from './services/speedometer.service';

@Component({
  selector: 'speedometer',
  imports: [CommonModule, DigitComponent, BlinkComponent, SubSecondsComponent],
  templateUrl: './speedometer.component.html',
  styleUrl: './speedometer.component.scss',
})
export class SpeedometerComponent {
  private svc = inject(SpeedometerService);
  public time$ = inject(ClocksService).time$;

  public get isSoundOn() {
    return this.svc.isSoundOn();
  }

  public soundHandler(e: Event) {
    const { checked } = e.target as HTMLInputElement;
    this.svc.isSoundOn.set(checked);
  }
}
