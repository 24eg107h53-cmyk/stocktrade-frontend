import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export const StockChart = ({ stock }) => {
  const [period, setPeriod] = useState('1D');

  const periods = ['1D', '1W', '1M', '6M', '1Y'];

  const chartData = useMemo(() => {
    if (!stock) return { labels: [], datasets: [] };

    const current = Number(stock.currentPrice || 100);
    const prevClose = Number(stock.previousClose || current);
    const high = Number(stock.high || current * 1.02);
    const low = Number(stock.low || current * 0.98);
    const isPositive = current >= prevClose;

    let pointsCount = 24;
    let labels = [];
    let startVal = prevClose;
    let volatility = 0.008;

    switch (period) {
      case '1D':
        pointsCount = 18;
        labels = [
          '9:15 AM', '9:45 AM', '10:15 AM', '10:45 AM', '11:15 AM', '11:45 AM',
          '12:15 PM', '12:45 PM', '1:15 PM', '1:45 PM', '2:15 PM', '2:45 PM',
          '3:00 PM', '3:15 PM', '3:20 PM', '3:25 PM', '3:28 PM', '3:30 PM'
        ];
        startVal = prevClose;
        volatility = 0.004;
        break;
      case '1W':
        pointsCount = 7;
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Yesterday', 'Today'];
        startVal = current * (isPositive ? 0.97 : 1.03);
        volatility = 0.012;
        break;
      case '1M':
        pointsCount = 15;
        labels = Array.from({ length: 15 }, (_, i) => `Day ${i * 2 + 1}`);
        startVal = current * (isPositive ? 0.94 : 1.06);
        volatility = 0.018;
        break;
      case '6M':
        pointsCount = 12;
        labels = ['Month -5', 'Month -4', 'Month -3', 'Month -2', 'Last Month', 'This Month'];
        startVal = Number(stock.fiftyTwoWeekLow || current * 0.85);
        volatility = 0.025;
        break;
      case '1Y':
        pointsCount = 12;
        labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
        startVal = Number(stock.fiftyTwoWeekLow || current * 0.8);
        volatility = 0.03;
        break;
      default:
        break;
    }

    // Generate smooth walk from startVal to current
    const values = [];
    const step = (current - startVal) / (labels.length - 1);
    for (let i = 0; i < labels.length; i++) {
      if (i === labels.length - 1) {
        values.push(current);
      } else {
        const trend = startVal + step * i;
        const noise = (Math.sin(i * 1.5) * 0.5 + (Math.random() - 0.5)) * (trend * volatility);
        let val = Math.max(low * 0.99, Math.min(high * 1.01, trend + noise));
        values.push(Number(val.toFixed(2)));
      }
    }

    const strokeColor = isPositive ? '#10b981' : '#ef4444';
    const fillColor = isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: `${stock.symbol} Price`,
          data: values,
          borderColor: strokeColor,
          backgroundColor: fillColor,
          borderWidth: 2,
          pointRadius: period === '1D' ? 0 : 3,
          pointHoverRadius: 6,
          pointBackgroundColor: strokeColor,
          tension: 0.35,
        },
      ],
    };
  }, [stock, period]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#0f172a',
        titleColor: '#94a3b8',
        bodyColor: '#f8fafc',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        callbacks: {
          label: (context) => `₹${Number(context.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(51, 65, 85, 0.25)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          maxRotation: 0,
        },
      },
      y: {
        grid: {
          color: 'rgba(51, 65, 85, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (value) => `₹${value}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Price Action</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-100">{stock.symbol}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Interactive
            </span>
          </div>
        </div>

        {/* Timeframe Buttons: 1D, 1W, 1M, 6M, 1Y */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                period === p
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
