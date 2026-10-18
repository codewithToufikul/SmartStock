import { useGetDemandForecastQuery } from "./forecast.api";

export default function DemandForecastTable() {
    const { data, isLoading, isError } = useGetDemandForecastQuery(30);

    if (isLoading) {
        return (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">
                    Loading demand forecast...
                </p>
            </section>
        );
    }

    if (isError || !data) {
        return (
            <section className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <p className="text-sm text-rose-700">
                    Failed to load demand forecast. Check the API response.
                </p>
            </section>
        );
    }

    const forecasts = Array.isArray(data) ? data : [];

    return (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                    Product Demand Forecast
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Estimated demand based on the last 30 days of sales.
                </p>
            </div>

            {forecasts.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">
                    No products available for forecasting.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Current Stock</th>
                                <th className="px-6 py-4 font-semibold">Units Sold</th>
                                <th className="px-6 py-4 font-semibold">Daily Demand</th>
                                <th className="px-6 py-4 font-semibold">Days Remaining</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {forecasts.map((product) => (
                                <tr key={product.productId} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <p className="font-medium text-slate-900">
                                            {product.name}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {product.sku}
                                        </p>
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                        {product.currentStock}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {product.totalUnitsSold}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {product.averageDailyDemand.toFixed(2)}
                                    </td>

                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {product.estimatedDaysRemaining === null
                                            ? "N/A"
                                            : `${product.estimatedDaysRemaining.toFixed(1)} days`}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${product.currentStock === 0
                                                    ? "bg-rose-100 text-rose-700"
                                                    : product.lowStock
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-emerald-100 text-emerald-700"
                                                }`}
                                        >
                                            {product.currentStock === 0
                                                ? "Out of stock"
                                                : product.lowStock
                                                    ? "Low stock"
                                                    : "Healthy"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}