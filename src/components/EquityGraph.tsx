
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
import { formatNumberWithCommas } from '@/utils/formatters';

interface EquityPoint {
  raised: number;
  totalRaised: number;
  equityGranted: number;
  totalEquityGranted: number;
  targetRaised: number;
  totalTargetRaised: number;
  label: string;
  order: number; // Add order property to sort points
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
      totalRaised: cumulativeRaised,
      equityGranted: equityGranted,
      totalEquityGranted: cumulativeEquity,
      targetRaised: targetRaised,
      totalTargetRaised: cumulativeTargetRaised,
      label: round.name,
      order: round.order
    });
  });
  
  // The "Future" data point code has been removed
  
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
          <p>Raised: ${data.raised.toFixed(2)}M</p>
          <p>Total Raised: ${data.totalRaised.toFixed(2)}M</p>
          <p>Target for Round: ${data.targetRaised.toFixed(2)}M</p>
          <p>Total Target: ${data.totalTargetRaised.toFixed(2)}M</p>
          <p>Equity Granted: {data.equityGranted.toFixed(2)}%</p>
          <p>Total Equity Granted: {data.totalEquityGranted.toFixed(2)}%</p>
          <p>Founder Equity: {(100 - data.totalEquityGranted).toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend renderer to add more spacing between items
  const CustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex items-center justify-center gap-8 mt-2 mb-4">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div 
              className="w-4 h-4"
              style={{ 
                backgroundColor: entry.color,
                ...(entry.dataKey === 'totalTargetRaised' ? { borderStyle: 'dashed', borderWidth: '1px', backgroundColor: 'transparent' } : {})
              }}
            />
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Find the maximum value for the domain
  const maxRaised = Math.max(...equityData.map(point => point.totalRaised || 0.1));
  // Add some padding to the max value
  const domainMax = maxRaised * 1.2;

  // Create custom X axis ticks for better visibility
  const customXAxisTicks = [0.1, 0.5, 1, 2, 5, 10, 20, 50, 100].filter(tick => tick <= domainMax);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl text-left">Total Equity Granted vs. Total Raised</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={equityData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }} // Increased bottom margin for axis labels
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="totalRaised" 
                label={{ 
                  value: 'Total Raised ($ millions)', 
                  position: 'insideBottom', 
                  offset: -10,
                  fill: '#666',
                  fontSize: 14 
                }}
                tickFormatter={(value) => `$${value}M`}
                domain={[0.1, domainMax]} 
                type="number"
                scale="log" 
                allowDataOverflow={true}
                ticks={customXAxisTicks}
                height={70} // Increased height for better visibility
                tick={{ fontSize: 12, fill: '#666' }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                label={{ value: 'Total Equity Granted (%)', angle: -90, position: 'insideLeft', offset: 10, fill: '#666', fontSize: 14 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                content={<CustomLegend />} 
                verticalAlign="top" 
                height={50}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Line 
                type="monotone" 
                dataKey="totalEquityGranted" 
                name="Total Equity Granted"
                stroke="#8884d8" 
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                label={({ x, y, value }) => {
                  // Show labels for specific points to avoid clutter
                  if (value > 0) {
                    return (
                      <text x={x} y={y - 10} fill="#8884d8" textAnchor="middle" dominantBaseline="middle">
                        {value.toFixed(1)}%
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
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between">
            <div>
              <h3 className="font-bold text-left">Founder Equity</h3>
              <p className="text-3xl font-semibold text-left">{founderEquity.toFixed(2)}%</p>
            </div>
            
            <div>
              <h3 className="font-bold text-left">Total Raised</h3>
              <p className="text-3xl font-semibold text-left">
                ${formatNumberWithCommas(totalCommitted / 1000000)}M
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
