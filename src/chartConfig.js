import { Chart, ArcElement, LineElement, BarElement, CategoryScale, LinearScale, PointElement, LineController, BarController, DoughnutController, Tooltip, Legend } from 'chart.js';

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineController,
  BarController,
  DoughnutController,
  Tooltip,
  Legend
);

export default Chart;
