import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useGetDailySalesQuery } from "./sales-analytics.api";

export default function DailySalesChart() {
    const { data, isLoading, isError } = useGetDailySalesQuery(7);

    if (isLoading) {
        return (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">Loading sales analytics...</p>
            </section>
        );
    }

    if (isError || !data) {
        return (
            <section className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <p className="text-sm text-rose-700">
                    Failed to load daily sales. Please check the API response.
                </p>
            </section>
        );
    }

    const salesList = Array.isArray(data) ? data : [];

    const chartData = salesList.map((item) => ({
        ...item,
        day: new Date(`${item.date}T00:00:00Z`).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            timeZone: "UTC",
        }),
    }));

    const totalRevenue = salesList.reduce((sum, item) => sum + item.revenue, 0);
    const totalUnits = salesList.reduce((sum, item) => sum + item.unitsSold, 0);

    return (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Daily Sales
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Revenue performance over the last 7 days.
                    </p>
                </div>

                <div className="flex gap-6">
                    <div>
                        <p className="text-xs text-slate-500">Total Revenue</p>
                        <p className="mt-1 text-xl font-bold text-indigo-600">
                            ৳{totalRevenue.toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-slate-500">Units Sold</p>
                        <p className="mt-1 text-xl font-bold text-emerald-600">
                            {totalUnits.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 12, left: 4, bottom: 4 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                        />

                        <YAxis
                            width={65}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: "#64748b" }}
                            tickFormatter={(value: number) => `৳${value}`}
                        />

                        <Tooltip
                            formatter={(value) => [
                                `৳${Number(value).toLocaleString()}`,
                                "Revenue",
                            ]}
                            labelStyle={{ color: "#0f172a" }}
                        />

                        <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
}