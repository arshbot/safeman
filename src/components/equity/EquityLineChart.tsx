
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
import { formatCurrency } from '@/utils/formatters';
import { Round } from '@/types';
import { createLogTicks } from '@/utils/equityUtils';

interface EquityLineChartProps {
  totalCommitted: number;
  rounds: Round[];
}

export function EquityLineChart({ totalCommitted, rounds }: EquityLineChartProps) {
  // Create data points for funding rounds
  const fundingData = rounds.map((round, index) => ({
    name: round.name,
    amount: round.targetAmount || 0,
    index
  }));
  
  const maxValue = Math.max(totalCommitted, 100); // Ensure minimum for scale
  
  const xAxisTicks = createLogTicks(maxValue);

  // Format the x-axis tick labels
  const formatXAxis = (value: number) => {
    // Convert from thousands to display format
    if (value >= 1000) {
      return `$${value/1000}M`;
    }
    return `$${value}K`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        
        {/* X-axis with explicit ticks for log scale */}
        <XAxis 
          dataKey="amount"
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
          tickFormatter={(value) => formatCurrency(value)}
          domain={[0, 'auto']}
          tick={{ fontSize: 14, fill: '#333', fontWeight: 500 }}
          axisLine={{ stroke: '#666' }}
          tickLine={{ stroke: '#666' }}
          width={60}
          label={{ 
            value: 'Funding Amount', 
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
        
        <Tooltip 
          formatter={(value) => formatCurrency(Number(value))}
          labelFormatter={(label) => `Round: ${label}`}
        />
        
        <Legend
          verticalAlign="top"
          height={50}
          iconType="circle"
          iconSize={14}
          formatter={(value) => <span style={{ color: '#333', fontSize: '1rem', fontWeight: 500 }}>{value}</span>}
        />
        
        {/* Render funding data */}
        <Line 
          data={fundingData}
          type="monotone" 
          dataKey="amount" 
          name="Funding Amount"
          stroke="#8884d8" 
          strokeWidth={3}
          dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 8 }}
          label={({ x, y, value }) => {
            if (value > 1000) {
              return (
                <text 
                  x={x} 
                  y={y - 15} 
                  fill="#8884d8" 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fontWeight="500"
                >
                  {formatCurrency(Number(value))}
                </text>
              );
            }
            return null;
          }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
