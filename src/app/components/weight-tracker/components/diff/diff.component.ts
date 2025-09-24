import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { fillLinearDaily } from '../../weight-tracker.utils';

@Component({
  selector: 'diff',
  imports: [CommonModule],
  templateUrl: './diff.component.html',
  styleUrl: './diff.component.scss',
})
export class DiffComponent {
  public data = input<any[]>([]);

  public diffs = computed(() => [
    {
      diff: this.getDiff(1),
      title: 'One day diff:',
    },
    {
      diff: this.getDiff(7),
      title: 'One week diff:',
    },
    {
      diff: this.getDiff(14),
      title: 'Two week diff:',
    },
    {
      diff: this.getDiff(21),
      title: 'Three week diff:',
    },
    {
      diff: this.getDiff(),
      title: 'Month to date diff:',
    },
    {
      diff: this.getDiff(this.data().length - 1),
      title: 'Total diff:',
    },
  ]);

  public getDiff(dist: number = new Date().getDate() + 1) {
    const dataPoints = fillLinearDaily(this.data());
    let value: number = dataPoints.at(-1)?.y! - dataPoints.at(-dist - 1)?.y!;
    return {
      value: isNaN(value) ? 0 : Math.abs(value),
      className: value <= 0 ? 'down' : 'up',
    };
  }
}
