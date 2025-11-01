import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { Poll } from "../types/poll";

const COLORS = ["#00B7C2", "#007A74", "#FFD369", "#FF6F59", "#6b7280", "#8b5cf6"]; // extend as needed

export function PollChart({ poll }: { poll: Poll }) {
  const data = poll.options.map((opt, i) => ({
    name: opt.label,
    value: poll.votes[opt.id] ?? 0,
    color: COLORS[i % COLORS.length],
  }));

  const total = data.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={40}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v as number} (${Math.round(((v as number) / total) * 100)}%)`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


