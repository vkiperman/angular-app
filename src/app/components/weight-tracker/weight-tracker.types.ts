interface SataSeries {
  visible: boolean;
  name: string;
}

interface ChartDataOptions {
  visible: boolean;
}

interface ChartData {
  options: ChartDataOptions;
}

interface Chart {
  data: ChartData[];
  render: () => void;
}

export interface ItemClickEvent {
  dataSeriesIndex: number;
  dataSeries: SataSeries;
  chart: Chart;
}
