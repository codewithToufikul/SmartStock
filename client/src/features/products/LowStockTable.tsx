import { useGetLowStockProductsQuery } from "./products.api";

export default function LowStockTable() {
    const { data, isLoading, isError } = useGetLowStockProductsQuery();

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
                Loading low-stock products...
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
                Failed to load low-stock products.
            </div>
        );
    }

    const products = data.products ?? [];
    const total = data.total ?? products.length;

    return (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Low-stock products
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Products that have reached their stock threshold.
                    </p>
                </div>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                    {total} products
                </span>
            </div>

            {products.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">
                    All products have sufficient stock.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">SKU</th>
                                <th className="px-6 py-4 font-semibold">Current Stock</th>
                                <th className="px-6 py-4 font-semibold">Threshold</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50">
                                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">
                                        {product.name}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                                        {product.sku}
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-rose-600">
                                        {product.stockQuantity}
                                    </td>

                                    <td className="px-6 py-4 text-slate-600">
                                        {product.lowStockThreshold}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${product.stockQuantity === 0
                                                    ? "bg-rose-100 text-rose-700"
                                                    : "bg-amber-100 text-amber-700"
                                                }`}
                                        >
                                            {product.stockQuantity === 0
                                                ? "Out of stock"
                                                : "Low stock"}
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