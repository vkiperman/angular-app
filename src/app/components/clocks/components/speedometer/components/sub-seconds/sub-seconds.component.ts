import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { ClocksService } from '../../../../services/clocks.service';
import { DigitComponent } from '../digit/digit.component';

@Component({
  selector: 'sub-seconds',
  imports: [CommonModule, DigitComponent],
  templateUrl: './sub-seconds.component.html',
  styleUrl: './sub-seconds.component.scss',
})
export class SubSecondsComponent {
  public time$ = inject(ClocksService).decaseconds$.pipe(
    map((n) => `${n}`.padStart(3, '0').slice(0, 2)),
  );
}
