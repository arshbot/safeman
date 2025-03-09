
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/context/CRMContext';
import { formatNumberWithCommas, formatCurrency, formatPercentage } from '@/utils/formatters';

interface EquityPoint {
  raised: number;
  totalRaised: number;
  equityGranted: number;
  totalEquityGranted: number;
  targetRaised: number;
  totalTargetRaised: number;
  label: string;
  order: number;
}

export function EquityGraph() {
  const { state } = useCRM();
  
  // Calculate total committed across all rounds
  const totalCommitted = Object.values(state.rounds).reduce((sum, round) => {
    const roundVCs = round.vcs
      .map(vcId => state.vcs[vcId])
      .filter(vc => vc?.status === 'finalized' && vc.purchaseAmount);
    
    const roundTotal = roundVCs.reduce((total, vc) => total + (vc.purchaseAmount || 0), 0);
    return sum + roundTotal;
  }, 0);

  // Generate equity data points based on actual rounds
  const equityData: EquityPoint[] = [];
  
  // Start point
  equityData.push({
    raised: 0,
    totalRaised: 0.1, // Small non-zero value for logarithmic scale
    equityGranted: 0,
    totalEquityGranted: 0,
    targetRaised: 0,
    totalTargetRaised: 0.1, // Small non-zero value for logarithmic scale
    label: 'Start',
    order: -1 // Set order to -1 to ensure it's first
  });
  
  // Sort rounds by their order, but in reverse (highest order first)
  const sortedRounds = [...state.rounds].sort((a, b) => b.order - a.order);
  
  let cumulativeRaised = 0;
  let cumulativeEquity = 0;
  let cumulativeTargetRaised = 0;
  
  // For each round, calculate how much was raised and how much equity was granted
  sortedRounds.forEach(round => {
    const roundVCs = round.vcs
      .map(vcId => state.vcs[vcId])
      .filter(vc => vc?.status === 'finalized' && vc.purchaseAmount);
    
    const roundRaised = roundVCs.reduce((total, vc) => total + (vc.purchaseAmount || 0), 0) / 1000000; // Convert to millions
    const targetRaised = round.targetAmount / 1000000; // Convert to millions
    
    // Fixed equity calculation based on purchase amount and valuation cap
    // If valuation cap is less than or equal to 0, default to a reasonable value to avoid division by zero
    const effectiveValuation = round.valuationCap > 0 ? round.valuationCap : 10000000; // Default to $10M if no valuation cap
    
    // Calculate equity percentage more accurately - if round raised money, equity is based on amount raised
    // Equity percentage = (amount raised / valuation cap) * 100
    const equityGranted = (roundRaised * 1000000) / effectiveValuation * 100;
    
    cumulativeRaised += roundRaised;
    cumulativeEquity += equityGranted;
    cumulativeTargetRaised += targetRaised;
    
    // Add points for all rounds (even if they haven't raised money yet)
    equityData.push({
      raised: roundRaised,
      totalRaised: Math.max(cumulativeRaised, 0.1), // Ensure minimum value for log scale
      equityGranted: equityGranted,
      totalEquityGranted: cumulativeEquity,
      targetRaised: targetRaised,
      totalTargetRaised: Math.max(cumulativeTargetRaised, 0.1), // Ensure minimum value for log scale
      label: round.name,
      order: round.order
    });
  });
  
  // Sort the equity data points by their order, lowest first (early rounds first)
  equityData.sort((a, b) => a.order - b.order);
  
  const founderEquity = 100 - (equityData.length > 0 ? equityData[equityData.length - 1].totalEquityGranted : 0);

  // Format the tooltip to display more information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{data.label}</p>
          <p>Raised: {formatCurrency(data.raised)}</p>
          <p>Total Raised: {formatCurrency(data.totalRaised)}</p>
          <p>Target for Round: {formatCurrency(data.targetRaised)}</p>
          <p>Total Target: {formatCurrency(data.totalTargetRaised)}</p>
          <p>Equity Granted: {formatPercentage(data.equityGranted)}</p>
          <p>Total Equity Granted: {formatPercentage(data.totalEquityGranted)}</p>
          <p>Founder Equity: {formatPercentage(100 - data.totalEquityGranted)}</p>
        </div>
      );
    }
    return null;
  };

  // Create logarithmic tick values with better spread for the x-axis
  const createLogTicks = () => {
    const maxValue = Math.max(...equityData.map(d => d.totalRaised), 10); // Ensure at least 10M for scale
    
    // Start with our minimum value for log scale
    const ticks = [0.1];
    
    // Add additional values between 0.1 and 1
    if (maxValue >= 0.5) ticks.push(0.5);
    if (maxValue >= 1) ticks.push(1);
    
    // Add values from 2 to max, making sure we have a nice spread
    if (maxValue >= 2) ticks.push(2);
    if (maxValue >= 5) ticks.push(5);
    if (maxValue >= 10) ticks.push(10);
    if (maxValue >= 20) ticks.push(20);
    if (maxValue >= 50) ticks.push(50);
    if (maxValue >= 100) ticks.push(100);
    
    return ticks;
  };

  const xAxisTicks = createLogTicks();
  
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl text-left">Total Equity Granted vs. Total Raised</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart with fixed height */}
        <div className="h-[550px]">
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
              
              <Tooltip content={<CustomTooltip />} />
              
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
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mt-8">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold text-left">Founder Equity</h3>
              <p className="text-3xl font-semibold text-left">{formatPercentage(founderEquity)}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-left">Total Raised</h3>
              <p className="text-3xl font-semibold text-left">
                {formatCurrency(totalCommitted / 1000000)}
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-left">Funding Rounds</h3>
              <p className="text-3xl font-semibold text-left">{state.rounds.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
