"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, PieLabelRenderProps } from "recharts";

const COLORS = ["#16a34a", "#2563eb", "#f59e42", "#eab308", "#a21caf"];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: PieLabelRenderProps & { value: number }) => {
  const RADIAN = Math.PI / 180;
  // Calculate label position
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const safeMidAngle = midAngle ?? 0;
  const x = cx + radius * Math.cos(-safeMidAngle * RADIAN);
  const y = cy + radius * Math.sin(-safeMidAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#222" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={600}>
      {value}
    </text>
  );
};

interface PaymentMethodPieChartProps {
  data: { method: string; revenue: number }[];
}

export default function PaymentMethodPieChart({ data }: PaymentMethodPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="method"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label={renderCustomizedLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
