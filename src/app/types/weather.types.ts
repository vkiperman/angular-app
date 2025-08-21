export interface Points<T> {
  '@context': [string, BaseContext | Context];
  id?: string;
  type: string;
  geometry: Geometry;
  properties: T;
}

export interface BaseContext {
  '@version': string;
  '@vocab': string;
  geo: string;
  unit: string;
  wx: string;
}

export interface Context extends BaseContext {
  bearing: WithType;
  city: string;
  county: WithType;
  distance: WithType & WithId;
  forecastGridData: WithType;
  forecastOffice: WithType & WithId;
  geometry: WithType & WithId;
  publicZone: WithType;
  s: string;
  state: string;
  unitCode: WithType & WithId;
  value: WithId;
}

interface WithType {
  '@type': string;
}

interface WithId {
  '@id': string;
}

export interface Geometry {
  type: string;
  coordinates: number[] | number[][][];
}

export interface Properties extends WithType, WithId {
  cwa: string;
  forecastOffice: string;
  gridId: string;
  gridX: number;
  gridY: number;
  forecast: string;
  forecastHourly: string;
  forecastGridData: string;
  observationStations: string;
  relativeLocation: RelativeLocation;
  forecastZone: string;
  county: string;
  fireWeatherZone: string;
  timeZone: string;
  radarStation: string;
}

export interface ForecastProperties {
  units: string;
  forecastGenerator: string;
  generatedAt: string;
  updateTime: string;
  validTimes: string;
  elevation: Elevation;
  periods: Period[];
}

export interface RelativeLocation {
  type: string;
  geometry: Geometry;
  properties: RelativeLocationProperties;
}

export interface RelativeLocationProperties {
  city: string;
  state: string;
  distance: Bearing;
  bearing: Bearing;
}

export interface Bearing {
  unitCode: string;
  value: number;
}

export interface Elevation {
  unitCode: string;
  value: number;
}

export interface Period {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  temperatureTrend: string;
  probabilityOfPrecipitation: Elevation;
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}
