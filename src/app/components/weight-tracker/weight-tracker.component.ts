import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CanvasJSAngularChartsModule,
  CanvasJSChart,
} from '@canvasjs/angular-charts';
import deepEqual from 'deep-equal';
import {
  distinctUntilChanged,
  distinctUntilKeyChanged,
  filter,
  map,
  Observable,
  startWith,
  tap,
} from 'rxjs';
import { ConfigFormComponent } from './components/config-form/config-form.component';
import { DiffComponent } from './components/diff/diff.component';
import { StatsComponent } from './components/stats/stats.component';
import { WeightTrackerConfigState } from './store/weight-tracker-config.reducer';
import { WeightTrackerConfigStore } from './store/weight-tracker-config.store';
import { fillLinearDaily, WeightData } from './weight-tracker.utils';

// interface WeightData {
//   x: Date;
//   y: number;
// }

export const storageItemName = 'weight-tracker';

@Component({
  selector: 'weight-tracker',
  imports: [
    CanvasJSAngularChartsModule,
    CommonModule,
    ConfigFormComponent,
    DiffComponent,
    ReactiveFormsModule,
    StatsComponent,
  ],
  templateUrl: './weight-tracker.component.html',
  styleUrl: './weight-tracker.component.scss',
})
export class WeightTrackerComponent implements OnInit {
  private store = inject(WeightTrackerConfigStore);
  public weightTrackerConfig = signal<WeightTrackerConfigState | null>(null);
  public weightTrackerConfig$!: Observable<WeightTrackerConfigState>;

  public form = new FormGroup({
    x: new FormControl<Date>(
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
      ),
    ),
    y: new FormControl<number | null>(null),
    // w: new FormControl(new Date().getDay() < 1 || new Date().getDay() > 5),
  });

  public weekdays = [
    'Select One',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ].map((label, value) => ({ value: value - 1, label }));

  public legend: { color: string; label: string }[] = this.weekdays
    .slice(1)
    .map(({ label }, i) => ({
      label,
      color: this.getHSLA(i),
    }));

  public byWeekday!: FormGroup;
  public byWeekday$!: Observable<number>;

  public configForm!: FormGroup;
  public configForm$!: Observable<{ projectionSampleSize: number }>;

  private weightData = signal<WeightData[]>([]);

  public readonly projected = signal(
    this.slidingProjections(
      this.configForm?.get('projectionSampleSize')?.value!,
    ),
  );

  public todayIsRecorded = signal(false);

  @ViewChild(CanvasJSChart)
  public canvasJSChart!: CanvasJSChart;

  public ngOnInit(): void {
    this.weightTrackerConfig$ = this.store.getState().pipe(
      filter((state) => !!state),
      tap((state) => this.weightTrackerConfig.set(state)),
      distinctUntilChanged(deepEqual),
      tap(this.init.bind(this)),
    );

    this.configForm = new FormGroup({
      projectionSampleSize: new FormControl<number>(7, { nonNullable: true }),
    });
    this.configForm$ = this.configForm.valueChanges.pipe(
      distinctUntilKeyChanged('projectionSampleSize'),
      tap(({ projectionSampleSize }) => {
        this.projected.set(this.slidingProjections(projectionSampleSize));
        this.canvasJSChart.chart.render();
      }),
      startWith(this.configForm.value),
    );

    this.byWeekday = new FormGroup({
      weekday: new FormControl<number>(-1, { nonNullable: true }),
    });

    this.byWeekday$ = this.byWeekday.valueChanges.pipe(
      map(({ weekday }) => weekday),
      tap((weekday) => {
        console.log(
          this.getDedupedStoredData().filter(
            ({ x }) => +weekday < 0 || x.getDay() === +weekday,
          ),
        );
        this.weightData.update(() =>
          this.getDedupedStoredData().filter(
            ({ x }) => !+weekday || x.getDay() === +weekday,
          ),
        );
        this.canvasJSChart.chart.render();
      }),
      startWith(-1),
    );
    setTimeout(() => {
      localStorage.setItem(
        `${storageItemName}-backup`,
        localStorage.getItem(storageItemName)!,
      );
    }, 0);
  }

  private get weightMultiplier() {
    return this.weightTrackerConfig()?.units ? 0.453592 : 1;
  }

  private init() {
    this.weightData.update(() => this.getDedupedStoredData());

    this.form
      .get('y')
      ?.setValue(
        +(
          this.weightData()[this.weightData().length - 1]?.y *
          this.weightMultiplier
        ).toFixed(1),
      );

    this.projected.set(
      this.slidingProjections(
        this.configForm?.get('projectionSampleSize')?.value,
      ),
    );
    this.todayIsRecorded.set(this.getTodayIsRecorded());

    this.form.valueChanges.subscribe(({ x, y }) => {
      const now = new Date();
      const sinceLastEntry = Math.max(
        1,
        now.getDate() -
          this.weightData()[this.weightData().length - 1]?.x.getDate(),
      );

      if (sinceLastEntry >= 14) return; // skip validation if last entry was 2+ weeks ago
      const prevWeight = this.weightData()[this.weightData().length - 1]?.y;
      if (y && y < prevWeight - 14 * sinceLastEntry)
        return this.form.get('y')?.setErrors({ tooLow: true });
      if (y && y > prevWeight + 14 * sinceLastEntry)
        return this.form.get('y')?.setErrors({ tooHigh: true });
      this.form.get('y')?.setErrors(null);
    });
  }

  private getDedupedStoredData() {
    const seen = new Set<number>();
    return fillLinearDaily(
      [...JSON.parse(localStorage.getItem(storageItemName) || '[]')]
        .map(({ x, y }: WeightData) => ({
          x: new Date(x),
          y: y * this.weightMultiplier,
        }))
        .filter((item: WeightData) => !seen.has(+item.x) && seen.add(+item.x)),
    );
  }

  showDialog(dialog: HTMLDialogElement) {
    dialog.showModal();
  }
  hideDialog(dialog: HTMLDialogElement) {
    dialog.close();
  }

  handleShowTooltip(wt: number) {
    const a = this.weightData().find(({ y }) => wt === y);
    this.canvasJSChart.chart.toolTip.showAtX(a?.x);
  }

  handleHideTooltip() {
    this.canvasJSChart.chart.toolTip.hide();
  }

  getDiff(dist: number = new Date().getDate() + 1) {
    const { dataPoints } = this.data().data[0];
    const value = dataPoints.at(-1)?.y! - dataPoints.at(-dist - 1)?.y!;
    return {
      value: Math.abs(value).toFixed(2),
      className: value <= 0 ? 'down' : 'up',
    };
  }

  public data = computed(() => {
    const units = this.weightTrackerConfig()?.units ? ' KG' : ' lbs';
    return {
      zoomEnabled: true,
      animationEnabled: true,
      showInLegend: true,
      title: {
        text: 'Weight Tracker',
        fontFamily: 'Roboto, Helvetica, Verdana, Monospace',
        padding: 8,
        dockInsidePlotArea: false,
        textAlign: 'left',
      },
      axisX: {
        valueFormatString: 'DDD M/D/YY',
        interlacedColor: '#0000000A',
      },
      axisY: {
        title: `Weight (in ${units})`,
        suffix: units,
      },
      legend: {
        cursor: 'pointer',
        fontSize: 12,
        itemclick: this.itemclick,
      },
      toolTip: {
        shared: false,
      },
      data: [
        {
          visible: true,
          type: 'splineArea',
          name: 'Weight',
          showInLegend: true,
          color: 'rgba(54,158,173,.7)',
          xValueFormatString: 'DDD, MM/DD/YYYY',
          toolTipContent: `{y} ${units}<br>{x}`,
          dataPoints: this.weightData().map((w) => {
            return {
              ...w,
              color: this.getHSLA(w.x.getDay(), w.filledIn ? 0.2 : 1),
              click: this.handleChartClick.bind(this),
            };
          }),
        },
        {
          visible: true,
          type: 'splineArea',
          name: 'Projected Weight',
          showInLegend: true,
          color: 'hsla(188, 2%, 45%, 0.2)',
          xValueFormatString: 'MM/DD/YYYY',
          toolTipContent: `{y} ${units}<br>{x}`,
          dataPoints: this.projected(),
          lineDashType: 'dash',
        },
        {
          visible: false,
          type: 'line',
          name: 'Line of best fit',
          showInLegend: true,
          color: 'rgba(0, 104, 120, 0.85)',
          xValueFormatString: 'MM/DD/YYYY',
          toolTipContent: `{n} ${units}<br>{x}`,
          dataPoints: this.lineOfBestFit(),
          lineDashType: 'dash',
        },
      ],
    };
  });

  public handleChartClick(e: any) {
    console.log(e);
  }

  public handleChartReady(chart: object) {
    (chart as { render: () => void }).render();
  }

  private itemclick(e: {
    dataSeriesIndex: number;
    dataSeries: { visible: boolean; name: string };
    chart: {
      data: {
        options: { visible: boolean };
      }[];
      render: () => void;
    };
  }) {
    const visible = e.dataSeries.visible === undefined || e.dataSeries.visible;
    // if (e.dataSeriesIndex === 2)
    //   e.chart.data
    //     .filter((_, i) => i !== e.dataSeriesIndex)
    //     .forEach(({ options }) => (options.visible = visible));

    e.dataSeries.visible = !visible;

    e.chart.render();
  }

  public updateWeights() {
    if (this.form.invalid) return;

    this.weightData.update((state) => [
      ...state.filter(({ x }) => +x !== +this.form.value.x!),
      this.form.value as WeightData,
    ]);
    this.projected.set(
      this.slidingProjections(
        this.configForm.get('projectionSampleSize')?.value,
      ),
    );
    localStorage.setItem(storageItemName, JSON.stringify(this.weightData()));
    this.todayIsRecorded.set(this.getTodayIsRecorded());

    this.canvasJSChart.chart.render();
  }

  public getTodayIsRecorded() {
    const d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);

    return this.weightData().some(
      ({ x }) =>
        new Date(
          new Date(x).getFullYear(),
          new Date(x).getMonth(),
          new Date(x).getDate(),
        ).getTime() === d.getTime(),
    );
  }

  private getHSLA(i: number, o = 1.0) {
    return `hsla(${(i / 6) * 330}, 100%, 40%, ${o})`;
  }

  /**
   *
   * @param projectionSampleSize number
   * @returns an array where each item is the projection of the available data of the last @projectionSampleSize points
   */
  private slidingProjections(projectionSampleSize = 7): WeightData[] {
    const DAY = 24 * 60 * 60 * 1000;

    function regress(
      xs: number[],
      ys: number[],
    ): { m: number; b: number; ok: boolean } {
      const n = xs.length;
      if (n < 2) return { m: 0, b: ys[n - 1], ok: false };

      const meanX = xs.reduce((a, b) => a + b, 0) / n;
      const meanY = ys.reduce((a, b) => a + b, 0) / n;

      let num = 0;
      let den = 0;
      for (let i = 0; i < n; i++) {
        const dx = xs[i] - meanX;
        num += dx * (ys[i] - meanY);
        den += dx * dx;
      }

      if (den === 0) return { m: 0, b: ys[n - 1], ok: false }; // all xs identical
      const m = num / den;
      return { m, b: meanY - m * meanX, ok: true };
    }
    const data = this.weightData();

    return data
      .map((_, i) => {
        const start = Math.max(0, i - projectionSampleSize + 1);
        const window = data.slice(start, i + 1);

        const xs = window.map((d) => d.x.getTime());
        const ys = window.map((d) => d.y);

        let nextT: number;
        if (xs.length >= 2) {
          const last = xs[xs.length - 1];
          const prev = xs[xs.length - 2];
          const gap = Math.max(DAY, last - prev || DAY); // avoid zero/negative gap
          nextT = last + gap;
          // } else if (xs.length === 1) {
          //   nextT = xs[0] + DAY;
        } else {
          return data[i];
        }

        const { m, b, ok } = regress(xs, ys);
        const yhat = ok ? +(m * nextT + b).toFixed(1) : ys[ys.length - 1];

        return { x: new Date(nextT), y: yhat ?? null };
      })
      .filter(({ x }, i, src) => i === src.length - 1 || +x < +src[i + 1]?.x);
  }

  /**
   * Returns the best-fit line y = m*x + b for [{x: Date, y: number}] data.
   * x is treated as milliseconds since epoch.
   */
  lineOfBestFit() {
    const data = this.weightData();
    if (data.length < 2) {
      // throw new Error('Need at least 2 points to compute a best-fit line.');
      return [];
    }

    // Numeric x and y arrays
    const { xs, ys } = data.reduce(
      ({ xs, ys }, { x, y }) => ({
        xs: [...xs, x.getTime()],
        ys: [...ys, y],
      }),
      { xs: [] as number[], ys: [] as number[] },
    );

    const n = data.length;

    // Means
    const meanX = xs.reduce((sum, val) => sum + val, 0) / n;
    const meanY = ys.reduce((sum, val) => sum + val, 0) / n;

    // Slope (m) and intercept (b)
    let numerator = 0,
      denominator = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - meanX;
      numerator += dx * (ys[i] - meanY);
      denominator += dx * dx;
    }
    const m = numerator / denominator;
    const b = meanY - m * meanX;

    // Generate y-values for each original x
    const linePoints = xs.map((x) => ({
      x: new Date(x),
      y: m * x + b,
      n: (m * x + b).toFixed(1),
    }));

    return [linePoints.at(0), linePoints.at(-1)];
  }
}

// [{"x":"2025-07-21T05:00:00.000Z","y":208.1},{"x":"2025-07-23T05:00:00.000Z","y":210.4},{"x":"2025-07-24T05:00:00.000Z","y":209.9},{"x":"2025-07-25T05:00:00.000Z","y":207},{"x":"2025-07-26T05:00:00.000Z","y":208},{"x":"2025-07-28T05:00:00.000Z","y":207.7},{"x":"2025-07-29T05:00:00.000Z","y":208.3},{"x":"2025-07-30T05:00:00.000Z","y":205.4},{"x":"2025-08-01T05:00:00.000Z","y":210.3},{"x":"2025-08-03T05:00:00.000Z","y":209.7},{"x":"2025-08-04T05:00:00.000Z","y":208.3},{"x":"2025-08-05T05:00:00.000Z","y":207.6},{"x":"2025-08-06T05:00:00.000Z","y":207.1},{"x":"2025-08-30T05:00:00.000Z","y":204.2},{"x":"2025-08-31T05:00:00.000Z","y":206.6},{"x":"2025-09-01T05:00:00.000Z","y":205.6},{"x":"2025-09-02T05:00:00.000Z","y":205.8},{"x":"2025-09-03T05:00:00.000Z","y":204},{"x":"2025-09-04T05:00:00.000Z","y":204.8},{"x":"2025-09-05T05:00:00.000Z","y":204.3},{"x":"2025-09-06T05:00:00.000Z","y":203.4},{"x":"2025-09-08T05:00:00.000Z","y":206},{"x":"2025-09-09T05:00:00.000Z","y":205.9},{"x":"2025-09-10T05:00:00.000Z","y":204.8},{"x":"2025-09-11T05:00:00.000Z","y":203.8},{"x":"2025-09-12T05:00:00.000Z","y":201.9}]
