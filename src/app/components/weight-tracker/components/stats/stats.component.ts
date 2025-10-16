import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { AvgPipe } from '../../../../pipes/avg.pipe';
import { DailyPerformancePipe } from '../../../../pipes/daily-performance.pipe';
import { HighPipe } from '../../../../pipes/high.pipe';
import { LowPipe } from '../../../../pipes/low.pipe';

@Component({
  selector: 'stats',
  imports: [AvgPipe, CommonModule, HighPipe, LowPipe, DailyPerformancePipe],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  public data = input<any[]>([]);
  public canvasJSChart = input<any>({});

  public handleShowTooltip(wt: number) {
    const a = this.data().find(({ y }) => wt === y);
    this.canvasJSChart().chart.toolTip.showAtX(a?.x);
  }

  public handleHideTooltip() {
    this.canvasJSChart().chart.toolTip.hide();
  }
}
