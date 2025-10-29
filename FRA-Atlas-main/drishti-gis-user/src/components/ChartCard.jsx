import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ChartCard({ title, type, data, options = {}, language = 'en' }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false, // We'll use our own title
      },
    },
    scales: type === 'doughnut' ? {} : {
      y: {
        beginAtZero: true,
      },
    },
  };

  const chartOptions = { ...defaultOptions, ...options };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={chartOptions} height={300} />;
      case 'line':
        return <Line data={data} options={chartOptions} height={300} />;
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} height={300} />;
      default:
        return <div className="flex items-center justify-center h-64 text-gray-500">
          {language === 'en' ? 'Unsupported chart type' : 'असमर्थित चार्ट प्रकार'}
        </div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      <div className="h-64">
        {data ? renderChart() : (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
