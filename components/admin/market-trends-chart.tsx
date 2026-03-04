"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const categoryData = [
  { name: "3D Modeling", value: 842, color: "#0ea5e9" },
  { name: "Illustration", value: 1124, color: "#a47864" },
  { name: "Video Editing", value: 567, color: "#10b981" },
  { name: "Photography", value: 489, color: "#f59e0b" },
  { name: "Graphic Design", value: 376, color: "#8b5cf6" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;

  const data = payload[0].payload;
  const total = categoryData.reduce((sum, d) => sum + d.value, 0);
  const percent = ((data.value / total) * 100).toFixed(1);

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm font-semibold text-foreground">{data.name}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {data.value.toLocaleString()} uploads ({percent}%)
      </p>
    </div>
  );
}

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string }>;
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function MarketTrendsChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-2 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Most Popular Categories</h3>
        <p className="text-xs text-muted-foreground">Based on student uploads</p>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
