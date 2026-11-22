"use client";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#c8321e", "#f08a24", "#3f8f55", "#e6b422", "#7a5c48", "#9aa0a6"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#e6a817", accepted: "#3f8f55", approved: "#3f8f55", rejected: "#c8321e", cancelled: "#9aa0a6", inactive: "#9aa0a6",
  vendor: "#f08a24", customer: "#c8321e", admin: "#3f8f55",
};

export function DonutChart({ data }: { data: Record<string, number> | undefined }) {
  const rows = Object.entries(data ?? {}).map(([name, value]) => ({ name, value })).filter((r) => r.value > 0);
  if (!rows.length) return <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data yet</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
            {rows.map((r, i) => <Cell key={r.name} fill={STATUS_COLORS[r.name] ?? COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip /><Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBar({ data, x, y, color = "#c8321e" }: { data: Record<string, any>[]; x: string; y: string; color?: string }) {
  if (!data?.length) return <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data yet</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -10, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
          <XAxis dataKey={x} tickLine={false} axisLine={false} fontSize={12} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip cursor={{ fill: "rgba(200,50,30,0.08)" }} />
          <Bar dataKey={y} fill={color} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
