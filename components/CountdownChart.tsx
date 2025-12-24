
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CountdownChartProps {
  percentage: number;
  label: string;
}

const CountdownChart: React.FC<CountdownChartProps> = ({ percentage, label }) => {
  const data = [
    { name: 'Remaining', value: percentage },
    { name: 'Elapsed', value: 100 - percentage },
  ];

  const COLORS = ['#0ea5e9', '#f1f5f9'];

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={28}
            outerRadius={40}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[11px] font-black text-slate-600 leading-tight text-center px-1">
          {label}
        </span>
      </div>
    </div>
  );
};

export default CountdownChart;
