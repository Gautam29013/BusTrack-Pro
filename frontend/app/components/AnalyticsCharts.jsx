'use client';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

/**
 * PunctualityChart - A sleek line chart showing historical on-time performance
 */
export function PunctualityChart({ data, routes }) {
  if (!data || data.length === 0) return <div className="text-gray-500 p-4 text-center">No data available</div>;

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[50, 100]} tickFormatter={(val) => `${val}%`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(13,20,36,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
            itemStyle={{ fontSize: '13px', fontWeight: 600 }}
            formatter={(value) => [`${value}%`, 'On-time']}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          {routes.map((r, i) => (
            <Line 
              key={r.number} 
              type="monotone" 
              dataKey={r.number} 
              name={`Route ${r.number}`} 
              stroke={r.color || ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 4]} 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2 }} 
              activeDot={{ r: 6 }} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * RidershipChart - An area chart visualizing peak hours
 */
export function RidershipChart({ data, routes }) {
  if (!data || data.length === 0) return <div className="text-gray-500 p-4 text-center">No data available</div>;

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {routes.map((r, i) => {
              const color = r.color || ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 4];
              return (
                <linearGradient key={`color${r.number}`} id={`color${r.number}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              );
            })}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} interval={2} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(13,20,36,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
            itemStyle={{ fontSize: '13px', fontWeight: 600 }}
            formatter={(value) => [`${value} pax`, 'Passengers']}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          {routes.map((r, i) => {
            const color = r.color || ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 4];
            return (
              <Area 
                key={r.number} 
                type="monotone" 
                dataKey={r.number} 
                name={`Route ${r.number}`} 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#color${r.number})`} 
              />
            );
          })}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
