import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { PartCategory } from "../types";
import { formatPriceToman } from "../utils";
import { PiggyBank, BarChart3 } from "lucide-react";

interface PartsChartProps {
  categories: PartCategory[];
}

export const PartsChart: React.FC<PartsChartProps> = ({ categories }) => {
  // Map categories to chart dataset, summarizing min/max sums
  const chartData = categories.map((cat) => {
    let minSum = 0;
    let maxSum = 0;

    cat.parts.forEach((p) => {
      minSum += p.priceRange.min;
      maxSum += p.priceRange.max;
    });

    return {
      name: cat.categoryName,
      "حداقل کل (تومان)": minSum,
      "حداکثر کل (تومان)": maxSum,
    };
  });

  // Calculate grand totals to present a summary
  const grandMin = chartData.reduce((acc, curr) => acc + curr["حداقل کل (تومان)"], 0);
  const grandMax = chartData.reduce((acc, curr) => acc + curr["حداکثر کل (تومان)"], 0);

  // Custom Formatter for Axis values to keep it readable (e.g., 1,200,000 -> 1.2M تومان)
  const formatYAxis = (tick: number) => {
    if (tick >= 1000000) {
      return `${(tick / 1000000).toFixed(1)}M ت`;
    } else if (tick >= 1000) {
      return `${(tick / 1000).toFixed(0)}k ت`;
    }
    return `${tick} ت`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div id="chart-tooltip" className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-lg text-right">
          <p className="text-slate-800 font-bold mb-1.5 text-xs">{label}</p>
          <p className="text-emerald-600 text-xs font-semibold">
            حداقل هزینه: {formatPriceToman(payload[0].value)}
          </p>
          <p className="text-rose-600 text-xs mt-1 font-semibold">
            حداکثر هزینه: {formatPriceToman(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="price-analytics-visualizer" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-base font-bold text-slate-800">تحلیل بودجه تعویض قطعات</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              مقایسه حداقل و حداکثر هزینه‌های احتمالی هر صنف و دسته‌بندی
            </p>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl flex items-center gap-3">
          <PiggyBank className="w-5 h-5 text-blue-600" />
          <div className="text-right">
            <span className="block text-[10px] text-slate-400 font-bold uppercase">سبد تخمینی مصرفی‌ها</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-bold text-emerald-600">
                {formatPriceToman(grandMin)}
              </span>
              <span className="text-slate-400 text-xs">تا</span>
              <span className="text-xs font-bold text-rose-600">
                {formatPriceToman(grandMax)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-72 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 5, left: 5, bottom: 5 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={9}
              tickFormatter={formatYAxis}
              tickLine={false}
              axisLine={false}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              iconSize={8}
              iconType="circle"
            />
            <Bar
              dataKey="حداقل کل (تومان)"
              fill="#10b981"
              radius={[3, 3, 0, 0]}
              name="حداقل هزینه"
            />
            <Bar
              dataKey="حداکثر کل (تومان)"
              fill="#ef4444"
              radius={[3, 3, 0, 0]}
              name="حداکثر هزینه"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
