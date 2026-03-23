"use client";

import api from "@/lib/api";
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type FilterType = "today" | "week" | "month" | "all";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "Today", value: "today" },
  { label: "Week",  value: "week"  },
  { label: "Month", value: "month" },
  { label: "All",   value: "all"   },
];

const MAX_COLOR = "#EF4444";
const PALETTE = [
  "#465FFF", "#10B981", "#F59E0B", "#8B5CF6",
  "#06B6D4", "#F97316", "#EC4899", "#14B8A6",
  "#A3E635", "#6366F1",
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-800" style={{ zIndex: 9999 }}>
        <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{label}</p>
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
          Visits:{" "}
          <span className="font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

// ✅ Custom angled X-axis tick so long names don't overlap
const CustomXAxisTick = ({ x, y, payload }: any) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={0}
      y={0}
      dy={10}
      textAnchor="end"
      fill="currentColor"
      fontSize={11}
      transform="rotate(-40)"
      className="text-gray-500 dark:text-gray-400"
    >
      {payload.value}
    </text>
  </g>
);

export default function LocalVisitChart() {
  const [filter, setFilter] = useState<FilterType>("today");
  const [chartData, setChartData] = useState<{ city: string; visits: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (f: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/Wb/local_area_chart?filter=${f}`);
      const d = res.data.data;
      const labels: string[] = d.labels;
      const values: number[] = d.datasets[0].data;
      const maxVal = Math.max(...values);

      setChartData(
        labels.map((city, i) => ({
          city,
          visits: values[i],
          color: values[i] === maxVal ? MAX_COLOR : PALETTE[i % PALETTE.length],
        }))
      );
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filter);
  }, [filter]);

  // ✅ Dynamic height — 40px per bar minimum, so all bars + labels fit
  const chartHeight = Math.max(300, chartData.length * 40)

  // ✅ Dynamic bottom margin for angled labels
  const bottomMargin = chartData.length > 8 ? 80 : 40

  return (
    <div className="rounded-2xl text-white border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Local Area Visits
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visits per local area — highest in{" "}
            <span className="font-medium text-red-500">red</span>
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/60">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                filter === f.value
                  ? "bg-white text-gray-800 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          Loading...
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center text-sm text-red-400">
          {error}
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-gray-400">
          No data available
        </div>
      ) : (
        // ✅ Scrollable wrapper so all bars are visible
        <div className="overflow-x-auto">
          <div style={{ minWidth: chartData.length * 50, height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 8, left: -16, bottom: bottomMargin }}
                barCategoryGap="35%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(156,163,175,0.2)"
                  vertical={false}
                />
                <XAxis
                  dataKey="city"
                  tick={<CustomXAxisTick />}  // ✅ angled labels
                  tickLine={false}
                  axisLine={false}
                  interval={0}               // ✅ show ALL labels, no skipping
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  tickLine={false}
                  axisLine={false}
                  className="text-gray-500 dark:text-gray-400"
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(156,163,175,0.08)" }}
                  wrapperStyle={{ zIndex: 9999, outline: "none" }}
                />
                <Bar dataKey="visits" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}