
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
import { formatPercentage, formatNumberWithCommas } from '@/utils/formatters';
import { EquityPoint } from '@/types';
import { createLogTicks } from '@/utils/equityUtils';

interface EquityLineChartProps {
  equityData: EquityPoint[];
}

export function EquityLineChart({ equityData }: EquityLineChartProps) {
  const xAxisTicks = createLogTicks(equityData);
  
  // For y-axis, create evenly distributed percentage ticks
  const yAxisTicks = [0, 25, 50, 75, 100];

  // Format the x-axis tick labels
  const formatXAxis = (value: number) => {
    if (value < 1) {
      return `$${value * 1000}K`;
    }
    return `$${value}M`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={equityData}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        
        {/* X-axis with explicit ticks for log scale */}
        <XAxis 
          dataKey="totalRaised"
          type="number"
          scale="log"
          domain={['auto', Math.max(...xAxisTicks)]}
          ticks={xAxisTicks}
          tickFormatter={(value) => {
            if (value === 0.1) return "$0.1M";
            return formatXAxis(value);
          }}
          tick={{ 
            fontSize: 14, 
            fill: '#333', 
            fontWeight: 500
          }}
          height={80}
          label={{ 
            value: 'Total Raised ($ millions)', 
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
        
        <Line 
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
        />
        
        <Line 
          type="monotone" 
          dataKey="totalTargetRaised" 
          name="Target Raised"
          stroke="#666" 
          strokeDasharray="5 5"
          strokeWidth={1.5}
          dot={{ stroke: '#666', strokeWidth: 1, r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
