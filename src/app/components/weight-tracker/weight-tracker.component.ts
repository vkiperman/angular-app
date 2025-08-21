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
import { distinctUntilChanged, filter, Observable, startWith, tap } from 'rxjs';
import { AvgPipe } from '../../pipes/avg.pipe';
import { HighPipe } from '../../pipes/high.pipe';
import { LowPipe } from '../../pipes/low.pipe';
import { ConfigFormComponent } from './components/config-form/config-form.component';
import { WeightTrackerConfigState } from './store/weight-tracker-config.reducer';
import { WeightTrackerConfigStore } from './store/weight-tracker-config.store';

interface WeightData {
  x: Date;
  y: number;
}

@Component({
  selector: 'weight-tracker',
  imports: [
    AvgPipe,
    CanvasJSAngularChartsModule,
    CommonModule,
    ConfigFormComponent,
    HighPipe,
    LowPipe,
    ReactiveFormsModule,
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
  public configForm!: FormGroup;
  public configForm$!: Observable<{ windowSize: number }>;
  private _weightDate = [
    { x: new Date(2025, 6, 21), y: 208.1 },
    { x: new Date(2025, 6, 23), y: 210.4 },
    { x: new Date(2025, 6, 24), y: 209.9 },
    { x: new Date(2025, 6, 25), y: 207.0 },
    { x: new Date(2025, 6, 26), y: 208.0 },
    { x: new Date(2025, 6, 28), y: 207.7 },
    { x: new Date(2025, 6, 29), y: 208.3 },
    { x: new Date(2025, 6, 30), y: 205.4 },
    { x: new Date(2025, 7, 1), y: 210.3 },
    { x: new Date(2025, 7, 3), y: 209.7 },
    { x: new Date(2025, 7, 4), y: 208.3 },
    { x: new Date(2025, 7, 5), y: 207.6 },
    { x: new Date(2025, 7, 6), y: 207.1 },
  ];

  private weightData = signal<WeightData[]>(this._weightDate);

  // private readonly projected = computed(() => this.projectEachStep());
  public readonly projected = signal(
    this.slidingProjections(this.configForm?.get('windowSize')?.value!),
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
      windowSize: new FormControl<number>(7),
    })!;
    this.configForm$ = this.configForm.valueChanges.pipe(
      tap(({ windowSize }) => {
        this.projected.set(this.slidingProjections(windowSize));
        this.canvasJSChart.chart.render();
      }),
      startWith(this.configForm.value),
    );
  }

  private init() {
    const wt = this.weightTrackerConfig()?.units ? 0.453592 : 1;

    this.weightData.update(() =>
      this.getDedupedStoredData().map(({ x, y }) => ({
        x,
        y: y * wt,
      })),
    );

    this.form
      .get('y')
      ?.setValue(
        +(this.weightData()[this.weightData().length - 1]?.y * wt).toFixed(1),
      );

    this.projected.set(
      this.slidingProjections(this.configForm?.get('windowSize')?.value),
    );
    this.todayIsRecorded.set(this.getTodayIsRecorded());
  }

  private getDedupedStoredData() {
    const seen = new Set<number>();
    return [
      ...this._weightDate,
      ...JSON.parse(localStorage.getItem('weight-tracker') || '[]'),
    ]
      .map(({ x, y }: WeightData) => ({ x: new Date(x), y }))
      .filter((item: WeightData) => !seen.has(+item.x) && seen.add(+item.x));
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
          dataPoints: this.weightData().map((w) => ({
            ...w,
            click: this.handleChartClick.bind(this),
          })),
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
    this.weightData.update((state) => [
      ...state.filter(({ x }) => +x !== +this.form.value.x!),
      this.form.value as WeightData,
    ]);
    this.projected.set(
      this.slidingProjections(this.configForm.get('windowSize')?.value),
    );
    localStorage.setItem('weight-tracker', JSON.stringify(this.weightData()));
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

  /**
   *
   * @param windowSize number
   * @returns an array where each item is the projection of the available data of the last @windowSize points
   */
  private slidingProjections(windowSize = 7): WeightData[] {
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
        const start = Math.max(0, i - windowSize + 1);
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
      .filter(({ x }, i, src) => +x !== +src[i - 1]?.x);
  }

  /**
   *
   * @param min number
   * @returns an array where each item is the projection of all the available data
   */
  private projectEachStep(min = 2) {
    const data = this.weightData();
    if (data.length < min) return [];

    const projections = data.slice(0, min);

    for (let i = min; i <= data.length; i++) {
      const subset = data.slice(0, i);
      const xs = subset.map(({ x }) => x.getTime());
      const ys = subset.map(({ y }) => y);

      const n = subset.length;
      const meanX = xs.reduce((sum, val) => sum + val, 0) / n;
      const meanY = ys.reduce((sum, val) => sum + val, 0) / n;

      let numerator = 0,
        denominator = 0;
      for (let j = 0; j < n; j++) {
        numerator += (xs[j] - meanX) * (ys[j] - meanY);
        denominator += (xs[j] - meanX) ** 2;
      }

      const m = numerator / denominator;
      const b = meanY - m * meanX;

      const lastDate = new Date(xs[xs.length - 1]);
      const x = new Date(lastDate.setDate(lastDate.getDate() + 1));
      const y = +(m * x.getTime() + b).toFixed(1);

      projections.push({
        x,
        y,
      });
    }

    return projections;
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
