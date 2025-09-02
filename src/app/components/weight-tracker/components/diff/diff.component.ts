import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'diff',
  imports: [],
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

  getDiff(dist: number = new Date().getDate() + 1) {
    const dataPoints = this.data();
    const value = dataPoints.at(-1)?.y! - dataPoints.at(-dist - 1)?.y!;
    return {
      value: isNaN(value) ? false : Math.abs(value).toFixed(2),
      className: value <= 0 ? 'down' : 'up',
    };
  }
}
