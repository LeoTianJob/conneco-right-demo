"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const activityData = [
  { day: "Mar 1", logins: 142, uploads: 38, downloads: 67 },
  { day: "Mar 2", logins: 158, uploads: 42, downloads: 71 },
  { day: "Mar 3", logins: 134, uploads: 35, downloads: 58 },
  { day: "Mar 4", logins: 171, uploads: 51, downloads: 82 },
  { day: "Mar 5", logins: 189, uploads: 48, downloads: 91 },
  { day: "Mar 6", logins: 167, uploads: 44, downloads: 76 },
  { day: "Mar 7", logins: 123, uploads: 29, downloads: 54 },
  { day: "Mar 8", logins: 145, uploads: 37, downloads: 63 },
  { day: "Mar 9", logins: 162, uploads: 45, downloads: 78 },
  { day: "Mar 10", logins: 178, uploads: 52, downloads: 85 },
  { day: "Mar 11", logins: 194, uploads: 58, downloads: 93 },
  { day: "Mar 12", logins: 183, uploads: 49, downloads: 87 },
  { day: "Mar 13", logins: 176, uploads: 46, downloads: 79 },
  { day: "Mar 14", logins: 131, uploads: 31, downloads: 56 },
  { day: "Mar 15", logins: 152, uploads: 40, downloads: 69 },
  { day: "Mar 16", logins: 168, uploads: 47, downloads: 81 },
  { day: "Mar 17", logins: 185, uploads: 55, downloads: 89 },
  { day: "Mar 18", logins: 199, uploads: 61, downloads: 96 },
  { day: "Mar 19", logins: 191, uploads: 53, downloads: 90 },
  { day: "Mar 20", logins: 174, uploads: 48, downloads: 83 },
  { day: "Mar 21", logins: 128, uploads: 33, downloads: 57 },
  { day: "Mar 22", logins: 149, uploads: 41, downloads: 68 },
  { day: "Mar 23", logins: 165, uploads: 46, downloads: 77 },
  { day: "Mar 24", logins: 182, uploads: 54, downloads: 88 },
  { day: "Mar 25", logins: 201, uploads: 62, downloads: 97 },
  { day: "Mar 26", logins: 195, uploads: 57, downloads: 92 },
  { day: "Mar 27", logins: 179, uploads: 50, downloads: 84 },
  { day: "Mar 28", logins: 136, uploads: 36, downloads: 61 },
  { day: "Mar 29", logins: 157, uploads: 43, downloads: 74 },
  { day: "Mar 30", logins: 172, uploads: 49, downloads: 80 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-foreground">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function StudentActivityChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-5 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-foreground">Student Activity</h3>
        <p className="text-xs text-muted-foreground">Account activity over the last 30 days</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activityData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingBottom: "12px" }}
            />
            <Line
              type="monotone"
              dataKey="logins"
              name="Logins"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="uploads"
              name="Uploads"
              stroke="#a47864"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="downloads"
              name="Downloads"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
