"use client";

import api from "@/lib/api";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#465FFF", "#10B981", "#F59E0B", "#EF4444"];

const CustomTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const percentage = ((item.value / total) * 100).toFixed(1);
    return (
      <div
        className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
        style={{ zIndex: 9999, position: "relative" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.payload.color }}
          />
          <span className="text-sm font-semibold text-gray-800 dark:text-white">
            {item.name}
          </span>
        </div>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {item.value}&nbsp;({percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) => {
  if (percent < 0.07) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 12, fontWeight: 600 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SalesPieChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/Wb/dashboard_counts");
        const d = res.data.data;
        setChartData([
          { name: "Free Ads",    value: d.total_ads - d.paid_ads, color: COLORS[0] },
          // { name: "Total Ads",   value: d.total_ads,              color: COLORS[1] },
          { name: "Paid Ads",    value: d.paid_ads,               color: COLORS[2] },
          { name: "Expired Ads", value: d.total_expired_ads,      color: COLORS[3] },
        ]);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const freeAds = chartData.find((item) => item.name === "Free Ads")?.value ?? 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Ads Overview
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Distribution of  ads
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-56 items-center justify-center text-sm text-gray-400">
          Loading...
        </div>
      ) : error ? (
        <div className="flex h-56 items-center justify-center text-sm text-red-400">
          {error}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          {/* overflow: visible lets the tooltip escape the clipped container */}
          <div
            className="relative h-56 w-full max-w-[220px] shrink-0 mx-auto"
            style={{ overflow: "visible" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                      style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                    />
                  ))}
                </Pie>
                {/* wrapperStyle z-index ensures tooltip renders above the center label */}
                <Tooltip
                  content={<CustomTooltip total={total} />}
                  wrapperStyle={{ zIndex: 9999, outline: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* pointer-events-none so center text never blocks slice hover */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-400 dark:text-gray-500">Total Ads</span>
              <span className="text-base font-bold text-gray-800 dark:text-white">
                {chartData[1].value}
              </span>
            </div>
          </div>

          {/* Clean label list */}
          <div className="flex w-full flex-col gap-1">
            {chartData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors duration-150"
                style={{
                  backgroundColor:
                    activeIndex === index ? `${item.color}18` : "transparent",
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <span
                  className="text-sm font-medium transition-colors duration-150 text-gray-600 dark:text-gray-400"
                  style={{
                    color: activeIndex === index ? item.color : undefined,
                  }}
                >
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white/80">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}