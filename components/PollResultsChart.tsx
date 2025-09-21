'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BarChart3, PieChart, Donut } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export interface PollResult {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

interface PollResultsChartProps {
  results: PollResult[];
  pollTitle: string;
  totalVotes: number;
  className?: string;
}

type ChartType = 'bar' | 'pie' | 'doughnut';

export default function PollResultsChart({ 
  results, 
  pollTitle, 
  totalVotes, 
  className 
}: PollResultsChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Generate colors for chart segments
  const generateColors = (count: number) => {
    const colors = [
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
      '#F97316', // Orange
      '#6366F1', // Indigo
    ];
    
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  // Generate Tailwind color classes for indicators
  const generateColorClasses = (count: number) => {
    const colorClasses = [
      'bg-blue-500',
      'bg-red-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-cyan-500',
      'bg-lime-500',
      'bg-orange-500',
      'bg-indigo-500',
    ];
    
    return Array.from({ length: count }, (_, i) => colorClasses[i % colorClasses.length]);
  };

  const colors = generateColors(results.length);
  const colorClasses = generateColorClasses(results.length);
  const labels = results.map(result => result.option_text);
  const data = results.map(result => result.vote_count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Votes',
        data,
        backgroundColor: colors.map(color => `${color}80`), // 50% opacity
        borderColor: colors,
        borderWidth: 2,
        hoverBackgroundColor: colors,
        hoverBorderColor: colors,
        hoverBorderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const result = results[context.dataIndex];
            return `${result.option_text}: ${result.vote_count} votes (${result.percentage}%)`;
          },
        },
      },
    },
    scales: chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    } : undefined,
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      options: chartOptions,
    };

    switch (chartType) {
      case 'bar':
        return <Bar {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      default:
        return <Bar {...commonProps} />;
    }
  };

  const getChartIcon = (type: ChartType) => {
    switch (type) {
      case 'bar':
        return <BarChart3 className="h-4 w-4" />;
      case 'pie':
        return <PieChart className="h-4 w-4" />;
      case 'doughnut':
        return <Donut className="h-4 w-4" />;
    }
  };

  if (!results || results.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Poll Results</CardTitle>
          <CardDescription>No votes yet for this poll</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Be the first to vote!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Poll Results</CardTitle>
            <CardDescription>
              {pollTitle} • {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-sm">
            Live Results
          </Badge>
        </div>
        
        {/* Chart Type Selector */}
        <div className="flex gap-2 mt-4">
          {(['bar', 'pie', 'doughnut'] as ChartType[]).map((type) => (
            <Button
              key={type}
              variant={chartType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType(type)}
              className="flex items-center gap-2"
            >
              {getChartIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Chart Container */}
        <div className="h-80 w-full">
          {renderChart()}
        </div>
        
        {/* Results Summary */}
        <div className="mt-6 space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Results Summary</h4>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={result.option_id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${colorClasses[index]}`}
                  />
                  <span className="font-medium">{result.option_text}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{result.vote_count} votes</span>
                  <span className="font-medium">{result.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
