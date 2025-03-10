
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { EquityChartTooltip } from './EquityChartTooltip';
import { formatPercentage } from '@/utils/formatters';
import { EquityPoint } from '@/types';
import { createLogTicks } from '@/utils/equityUtils';

interface EquityLineChartProps {
  actualEquityPoints: EquityPoint[];
  targetEquityPoints: EquityPoint[];
}

export function EquityLineChart({ actualEquityPoints, targetEquityPoints }: EquityLineChartProps) {
  // Find the maximum value across both datasets for x-axis scaling
  const maxActualValue = actualEquityPoints.length > 0 
    ? Math.max(...actualEquityPoints.map(d => d.totalRaised)) 
    : 100;
  
  const maxTargetValue = targetEquityPoints.length > 0 
    ? Math.max(...targetEquityPoints.map(d => d.totalRaised)) 
    : 100;
  
  const maxValue = Math.max(maxActualValue, maxTargetValue, 100); // Ensure minimum for scale
  
  const xAxisTicks = createLogTicks(maxValue);
  
  // For y-axis, create evenly distributed percentage ticks
  const yAxisTicks = [0, 25, 50, 75, 100];

  // Format the x-axis tick labels
  const formatXAxis = (value: number) => {
    // Convert from thousands to display format
    if (value >= 1000) {
      return `$${value/1000}M`;
    }
    return `$${value}K`;
  };

  // Combine data points for the chart, marking which line they belong to
  const actualPointsWithType = actualEquityPoints.map(point => ({
    ...point,
    dataType: 'actual'
  }));
  
  const targetPointsWithType = targetEquityPoints.map(point => ({
    ...point,
    dataType: 'target'
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        
        {/* X-axis with explicit ticks for log scale */}
        <XAxis 
          dataKey="totalRaised"
          type="number"
          scale="log"
          domain={[100, Math.max(...xAxisTicks)]}
          ticks={xAxisTicks}
          tickFormatter={formatXAxis}
          tick={{ 
            fontSize: 14, 
            fill: '#333', 
            fontWeight: 500
          }}
          height={80}
          label={{ 
            value: 'Total Raised', 
            position: 'bottom',
            offset: 40,
            style: { 
              textAnchor: 'middle',
              fontSize: 16,
              fontWeight: 'bold',
              fill: '#333'
            }
          }}
        />
        
        {/* Y-axis */}
        <YAxis 
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
          ticks={yAxisTicks}
          tick={{ fontSize: 14, fill: '#333', fontWeight: 500 }}
          axisLine={{ stroke: '#666' }}
          tickLine={{ stroke: '#666' }}
          width={60}
          label={{ 
            value: 'Total Equity Granted (%)', 
            angle: -90, 
            position: 'insideLeft',
            style: { 
              textAnchor: 'middle',
              fontSize: 16,
              fontWeight: 'bold',
              fill: '#333',
              dx: -30
            }
          }}
        />
        
        <Tooltip content={<EquityChartTooltip />} />
        
        <Legend
          verticalAlign="top"
          height={50}
          iconType="circle"
          iconSize={14}
          formatter={(value) => <span style={{ color: '#333', fontSize: '1rem', fontWeight: 500 }}>{value}</span>}
        />
        
        {/* Render the first dataset (actual equity granted) */}
        <Line 
          data={actualPointsWithType}
          type="monotone" 
          dataKey="totalEquityGranted" 
          name="Total Equity Granted"
          stroke="#8884d8" 
          strokeWidth={3}
          dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 8 }}
          label={({ x, y, value }) => {
            // Only show labels for values greater than 1%
            if (value > 1) {
              return (
                <text 
                  x={x} 
                  y={y - 15} 
                  fill="#8884d8" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fontWeight="500"
                >
                  {formatPercentage(value)}
                </text>
              );
            }
            return null;
          }}
          isAnimationActive={false}
        />
        
        {/* Render the second dataset (target equity granted) */}
        <Line 
          data={targetPointsWithType}
          type="monotone" 
          dataKey="totalEquityGranted" 
          name="Target Equity Granted"
          stroke="#666" 
          strokeDasharray="5 5"
          strokeWidth={1.5}
          dot={{ stroke: '#666', strokeWidth: 1, r: 3 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
