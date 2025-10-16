import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { DynamicRangeInputComponent } from './components/dynamic-range-input/dynamic-range-input.component';
import { StatsComponent } from './components/stats/stats.component';
import { WeightTrackerConfigState } from './store/weight-tracker-config.reducer';
import { WeightTrackerConfigStore } from './store/weight-tracker-config.store';
import {
  fillLinearDaily,
  getHSLA,
  lineOfBestFit,
  slidingProjections,
  WeightData,
} from './weight-tracker.utils';

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
    DynamicRangeInputComponent,
  ],
  templateUrl: './weight-tracker.component.html',
  styleUrl: './weight-tracker.component.scss',
})
export class WeightTrackerComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
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

  public dynamicRange = new FormGroup({
    range: new FormControl(),
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
      color: getHSLA(i),
    }));

  public byWeekday!: FormGroup;
  public byWeekday$!: Observable<number>;

  public configForm!: FormGroup;
  public configForm$!: Observable<{ projectionSampleSize: number }>;

  private weightData = signal<WeightData[]>([]);

  public readonly projected = signal(
    slidingProjections(
      this.weightData(),
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
        this.projected.set(
          slidingProjections(this.weightData(), projectionSampleSize),
        );
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
        const filtered = this.getDedupedStoredData().filter(
          ({ x }) => +weekday < 0 || x.getDay() === +weekday,
        );
        this.weightData.set(filtered);
        setTimeout(() => this.canvasJSChart.chart.render(), 1);
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

    this.dynamicRange.valueChanges
      .pipe(
        distinctUntilChanged(deepEqual),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((v) => {
        this.weightData.set(this.getDedupedStoredData().slice(-v.range));

        this.projected.set(
          slidingProjections(
            this.weightData(),
            this.configForm?.get('projectionSampleSize')?.value!,
          ),
        );
      });

    this.dynamicRange
      .get('range')
      ?.setValue(this.getDedupedStoredData().length);

    this.projected.set(
      slidingProjections(
        this.weightData(),
        this.configForm?.get('projectionSampleSize')?.value,
      ),
    );
    this.todayIsRecorded.set(this.getTodayIsRecorded());

    // this.checkTodayIsRecorded?.unsubscribe();
    // this.checkTodayIsRecorded = setupDateCheck()
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe(() => this.todayIsRecorded.set(false));

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ y }) => {
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

  public getDedupedStoredData() {
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

  private visible: boolean[] = [true, true, false];

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
        itemclick: this.itemclick.bind(this),
      },
      toolTip: {
        shared: false,
      },
      data: [
        {
          visible: this.visible[0],
          type: 'splineArea',
          name: 'Weight',
          showInLegend: true,
          color: 'rgba(54,158,173,.7)',
          xValueFormatString: 'DDD, MM/DD/YYYY',
          toolTipContent: `{y} ${units}<br>{x}`,
          dataPoints: this.weightData().map((w) => ({
            ...w,
            color: getHSLA(w.x.getDay(), w.filledIn ? 0.2 : 1),
            click: this.handleChartClick.bind(this),
          })),
        },
        {
          visible: this.visible[1],
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
          visible: this.visible[2],
          type: 'line',
          name: 'Line of best fit',
          showInLegend: true,
          color: 'rgba(0, 104, 120, 0.85)',
          xValueFormatString: 'MM/DD/YYYY',
          toolTipContent: `{n} ${units}<br>{x}`,
          dataPoints: lineOfBestFit(this.weightData()),
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

    this.visible[e.dataSeriesIndex] = !visible;
    e.dataSeries.visible = this.visible[e.dataSeriesIndex];

    e.chart.render();
  }

  public updateWeights() {
    if (this.form.invalid) return;

    this.dynamicRange
      .get('range')
      ?.setValue(this.getDedupedStoredData().length);

    this.weightData.update((state) => [
      ...this.getDedupedStoredData().filter(
        ({ x }) => +x !== +this.form.value.x!,
      ),
      this.form.value as WeightData,
    ]);
    this.projected.set(
      slidingProjections(
        this.weightData(),
        this.configForm.get('projectionSampleSize')?.value,
      ),
    );
    localStorage.setItem(
      storageItemName,
      JSON.stringify(this.weightData().filter(({ filledIn }) => !filledIn)),
    );
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
}
