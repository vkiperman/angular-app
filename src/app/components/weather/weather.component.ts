import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { Observable } from 'rxjs';
import { IncludesPipe } from '../../pipes/includes.pipe';
import { Weather } from '../../store/weather/weather.reducer';
import { WeatherStore } from '../../store/weather/weather.store';
import { WeatherPipe } from './weather.pipe';

@Component({
  selector: 'weather',
  imports: [
    CommonModule,
    IncludesPipe,
    CanvasJSAngularChartsModule,
    WeatherPipe,
  ],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss',
})
export class WeatherComponent implements OnInit {
  readonly store = inject(WeatherStore);
  public forecast$!: Observable<Weather['forecast']>;

  public ngOnInit(): void {
    this.forecast$ = this.store.selectForecast();
    navigator.geolocation?.getCurrentPosition(
      this.getWeather.bind(this),
      console.error,
      {
        enableHighAccuracy: true,
      },
    );
  }

  public getWeather(geo: GeolocationPosition): void {
    if (!geo) {
      console.log(geo, 'No geolocation data available');
      return;
    }
    this.store.getForecast(geo.coords.latitude, geo.coords.longitude);
  }

  public toggleDataSeries(e: any) {
    const visible = e.dataSeries.visible === undefined || e.dataSeries.visible;
    e.dataSeries.visible = !visible;
    e.chart.render();
  }
}
