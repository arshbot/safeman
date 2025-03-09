
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCRM } from '@/context/CRMContext';
import { formatNumberWithCommas } from '@/utils/formatters';

// Mock data structure representing funding rounds and equity dilution
interface EquityPoint {
  raised: number;
  equityGranted: number;
  totalEquityGranted: number;
  label: string;
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

  // Example equity data points - in a real app, this would be calculated based on actual rounds
  // These mimic the values in the screenshot
  const equityData: EquityPoint[] = [
    { raised: 0, equityGranted: 0, totalEquityGranted: 0, label: 'Start' },
    { raised: 0.5, equityGranted: 0.33, totalEquityGranted: 0.33, label: 'Friends & Family' },
    { raised: 0.75, equityGranted: 0.33, totalEquityGranted: 0.67, label: 'Angel' },
    { raised: 1.5, equityGranted: 2.00, totalEquityGranted: 2.67, label: 'Pre-seed' },
    { raised: 2, equityGranted: 0.96, totalEquityGranted: 3.63, label: 'Bridge' },
    { raised: 2.5, equityGranted: 1.92, totalEquityGranted: 5.55, label: 'Seed' },
    { raised: 3, equityGranted: 3.57, totalEquityGranted: 9.12, label: 'Series A' },
    { raised: 5, equityGranted: 4.29, totalEquityGranted: 13.41, label: 'Series B' },
    { raised: 10, equityGranted: 8.00, totalEquityGranted: 21.41, label: 'Series C' },
    { raised: 13, equityGranted: 0, totalEquityGranted: 21.41, label: 'Future' }
  ];

  const founderEquity = 100 - equityData[equityData.length - 1].totalEquityGranted;

  // Format the tooltip to display more information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{data.label}</p>
          <p>Raised: ${data.raised}M</p>
          <p>Equity Granted: {data.equityGranted}%</p>
          <p>Total Equity Granted: {data.totalEquityGranted}%</p>
          <p>Founder Equity: {(100 - data.totalEquityGranted).toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  // Calculate the equity table data
  const equityTableData = equityData.filter(point => point.raised > 0);

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
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="raised" 
                label={{ value: 'Total Raised ($M)', position: 'insideBottom', offset: -10 }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                label={{ value: 'Total Equity Granted', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="totalEquityGranted" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                label={({ x, y, value }) => {
                  // Only show labels for specific points to avoid clutter
                  const keyPoints = [0.33, 5.55, 9.12, 13.41, 21.41];
                  return keyPoints.includes(value) ? (
                    <text x={x} y={y - 10} fill="#8884d8" textAnchor="middle" dominantBaseline="middle">
                      {value}%
                    </text>
                  ) : null;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-bold text-left">Equity Granted</div>
              <div className="font-bold text-left">Total Equity Granted</div>
              {equityTableData.map((point, index) => (
                <React.Fragment key={index}>
                  <div className="text-left">{point.equityGranted}%</div>
                  <div className="text-left">{point.totalEquityGranted}%</div>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg col-span-2">
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
        </div>
      </CardContent>
    </Card>
  );
}
