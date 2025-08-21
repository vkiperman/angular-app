import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mergeMap, Observable } from 'rxjs';
import {
  ForecastProperties,
  Points,
  Properties,
} from '../../types/weather.types';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  constructor(private http: HttpClient) {}

  public getWeatherData(
    latitude: number,
    longitude: number,
  ): Observable<Points<ForecastProperties>> {
    return this.getPoints(latitude, longitude).pipe(
      mergeMap(({ properties }: Points<Properties>) =>
        this.http.get<Points<ForecastProperties>>(properties.forecast),
      ),
    );
  }

  private getPoints(
    latitude: number,
    longitude: number,
  ): Observable<Points<Properties>> {
    return this.http.get<Points<Properties>>(
      `https://api.weather.gov/points/${latitude},${longitude}`,
    );
  }
}
