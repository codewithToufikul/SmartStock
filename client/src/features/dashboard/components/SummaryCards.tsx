import { useGetDashboardSummaryQuery } from "../dashboard.api";

const cards = [
    {
        key: "totalProducts",
        label: "Total Products",
        color: "text-indigo-600",
    },
    {
        key: "totalStockUnits",
        label: "Stock Units",
        color: "text-sky-600",
    },
    {
        key: "lowStockCount",
        label: "Low Stock",
        color: "text-amber-600",
    },
    {
        key: "outOfStockCount",
        label: "Out of Stock",
        color: "text-rose-600",
    },
] as const;

export default function SummaryCards() {
    const { data, isLoading, isError } = useGetDashboardSummaryQuery();

    if (isLoading) {
        return (
            <p className="rounded-xl bg-white p-6 text-slate-500 shadow-sm">
                Loading dashboard...
            </p>
        );
    }

    if (isError || !data) {
        return (
            <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                Failed to load dashboard. Check your access token and backend.
            </p>
        );
    }

    return (
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
                <article
                    key={card.key}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <p className="text-sm font-medium text-slate-500">
                        {card.label}
                    </p>

                    <h2 className={`mt-4 text-3xl font-bold ${card.color}`}>
                        {(data[card.key] ?? 0).toLocaleString()}
                    </h2>
                </article>
            ))}

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                    Inventory Cost Value
                </p>

                <h2 className="mt-4 text-3xl font-bold text-slate-800">
                    ৳{(data.inventoryCostValue ?? 0).toLocaleString()}
                </h2>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                    Potential Selling Value
                </p>

                <h2 className="mt-4 text-3xl font-bold text-emerald-600">
                    ৳{(data.potentialSellingValue ?? 0).toLocaleString()}
                </h2>
            </article>
        </section>
    );
}