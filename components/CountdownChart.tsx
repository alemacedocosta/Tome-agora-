
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CountdownChartProps {
  percentage: number;
  label: string;
}

const CountdownChart: React.FC<CountdownChartProps> = ({ percentage, label }) => {
  // O gráfico representa o tempo que FALTA (Sky) vs o tempo que PASSOU (Slate)
  const data = [
    { name: 'Remaining', value: Math.max(0.1, percentage) }, // Pequeno valor mínimo para manter o círculo visível
    { name: 'Elapsed', value: Math.max(0, 100 - percentage) },
  ];

  const COLORS = ['#0ea5e9', '#f1f5f9']; // sky-500, slate-100

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={22}
            outerRadius={34} // Reduzido ligeiramente para dar margem de segurança extra
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={true}
            animationDuration={500}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                style={{ outline: 'none' }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-black text-slate-600 leading-tight text-center px-2">
          {label}
        </span>
      </div>
    </div>
  );
};

export default CountdownChart;
