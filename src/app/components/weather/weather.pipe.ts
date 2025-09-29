import { Pipe, PipeTransform } from '@angular/core';
import { ForecastProperties, Points } from '../../types/weather.types';

@Pipe({
  name: 'weather',
})
export class WeatherPipe implements PipeTransform {
  public transform(
    forecast: Points<ForecastProperties>,
    itemclick?: (e: unknown) => void,
  ) {
    const { temperatureUnit } = forecast.properties.periods[0];
    const baseConfig = {
      showInLegend: true,
      toolTipContent: `{y}°${temperatureUnit}<br>{x}<br>{name}`,
      type: 'spline',
      visible: true,
      xValueFormatString: 'MM/DD/YYYY',
    };

    const periods = forecast.properties.periods.map(
      ({ startTime, temperature: y, name, isDaytime }) => ({
        x: new Date(startTime),
        y,
        name,
        isDaytime,
      }),
    );

    return {
      zoomEnabled: true,
      animationEnabled: true,
      showInLegend: true,
      connectNullData: false,
      height: 260,
      title: {
        text: 'Weather Tracker',
      },
      axisX: {
        valueFormatString: 'MM/DD/YYYY',
      },
      axisY: {
        title: `Temp (in °${temperatureUnit})`,
        suffix: `°${temperatureUnit}`,
      },
      legend: {
        cursor: 'pointer',
        fontSize: 16,
        itemclick,
      },
      toolTip: {
        shared: false,
      },
      data: [
        {
          name: 'Day',
          color: 'rgba(0, 184, 208, 1)',
          dataPoints: periods.filter(({ isDaytime }) => isDaytime),
          ...baseConfig,
        },
        {
          name: 'Evening',
          color: 'rgba(0, 50, 56, 1)',
          dataPoints: periods.filter(({ isDaytime }) => !isDaytime),
          ...baseConfig,
        },
        {
          name: 'Full',
          color: 'rgba(146, 146, 146, 0.25)',
          dataPoints: periods,
          ...baseConfig,
        },
      ],
    };
  }
}
