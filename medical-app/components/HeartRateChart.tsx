'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export default function HeartRateChart({ data }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="mb-2 font-semibold">Heart Rate</h3>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="heart_rate" stroke="#2563eb" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}