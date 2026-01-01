"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Hàm rút gọn số tiền: 1.2tr, 500k
function formatCurrencyShort(value: number) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "tr";
  if (value >= 1_000) return (value / 1_000).toFixed(0) + "k";
  return value.toString();
}

interface RevenueByRouteBarChartProps {
  data: { route: string; revenue: number }[];
}

export default function RevenueByRouteBarChart({ data }: RevenueByRouteBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="route" />
        <YAxis width={60} tickFormatter={formatCurrencyShort} />
        <Tooltip />
        <Legend />
        <Bar dataKey="revenue" fill="#2563eb" />
      </BarChart>
    </ResponsiveContainer>
  );
}
