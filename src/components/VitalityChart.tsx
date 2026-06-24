import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

interface VitalityChartProps {
  activeMetric: string;
  getMetricData: (metric: string) => any[];
  getMetricGoal: (metric: string) => number;
}

export const VitalityChart = React.memo(({ activeMetric, getMetricData, getMetricGoal }: VitalityChartProps) => {
  const data = getMetricData(activeMetric || '');
  const goal = getMetricGoal(activeMetric || '');

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 'bold' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip 
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
            itemStyle={{ color: '#2D5A27', fontWeight: 'bold' }}
          />
          <ReferenceLine 
            y={goal} 
            stroke="#2D5A27" 
            strokeDasharray="5 5" 
            label={{ position: 'right', value: 'Target', fill: '#2D5A27', fontSize: 10, fontWeight: 'bold' }} 
          />
          <Bar dataKey="value" radius={[12, 12, 0, 0]}>
            {data.map((entry: any, index: number) => {
              const isNegativeMetric = activeMetric === 'Blood Sugar' || activeMetric === 'Blood Pressure' || activeMetric === 'Heart Rate';
              const isAchieved = isNegativeMetric ? entry.value <= goal : entry.value >= goal;
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={isAchieved ? '#2D5A27' : '#ef4444'} 
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
