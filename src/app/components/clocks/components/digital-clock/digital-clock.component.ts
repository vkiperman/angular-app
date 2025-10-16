import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ClocksService } from '../../services/clocks.service';
import { DigitComponent } from './components/digit/digit.component';

@Component({
  selector: 'digital-clock',
  imports: [CommonModule, DigitComponent],
  templateUrl: './digital-clock.component.html',
  styleUrl: './digital-clock.component.scss',
})
export class DigitalClockComponent {
  public clockSvc = inject(ClocksService);
  public time$ = this.clockSvc.time$;

  public setHour12(event: Event) {
    const { checked } = event.target as HTMLInputElement;
    this.clockSvc.hour12.set(checked);
  }
}
