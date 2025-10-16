import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ClocksService } from '../../services/clocks.service';
import { DigitComponent } from './components/digit/digit.component';

@Component({
  selector: 'dot-clock',
  imports: [CommonModule, DigitComponent],
  templateUrl: './dot-clock.component.html',
  styleUrl: './dot-clock.component.scss',
})
export class DotClockComponent {
  public time$ = inject(ClocksService).time$;
}
