import { useState } from "react";
import { useCreateProductMutation, useGetProductsQuery } from "./products.api";

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;
    const [isFormOpen, setIsFormOpen] = useState(true);
    const [createProduct, { isLoading: isCreating }] =
        useCreateProductMutation();

    const { data, isLoading, isError, refetch } = useGetProductsQuery({
        page,
        limit,
        searchQuery: searchQuery.trim() || undefined,
    });

    const products = data?.products ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    async function handleCreateProduct(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        const payload = {
            name: String(formData.get("name") ?? "").trim(),
            sku: String(formData.get("sku") ?? "").trim(),
            description: String(formData.get("description") ?? "").trim(),
            costPrice: Number(formData.get("costPrice")),
            sellingPrice: Number(formData.get("sellingPrice")),
            stockQuantity: Number(formData.get("stockQuantity")),
            lowStockThreshold: Number(formData.get("lowStockThreshold")),
        };

        try {
            await createProduct(payload).unwrap();
            setIsFormOpen(false);
            form.reset();
        } catch (error) {
            console.error("Failed to create product:", error);
            alert("Product তৈরি করা যায়নি। Input ও server error চেক করো।");
        }
    }

    return (
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form
                        onSubmit={handleCreateProduct}
                        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                Add Product
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="text-xl text-slate-500"
                                aria-label="Close form"
                            >
                                ×
                            </button>
                        </div>

                        {[
                            { name: "name", label: "Product Name", type: "text" },
                            { name: "sku", label: "SKU", type: "text" },
                            { name: "description", label: "Description", type: "text" },
                            { name: "costPrice", label: "Cost Price", type: "number" },
                            { name: "sellingPrice", label: "Selling Price", type: "number" },
                            { name: "stockQuantity", label: "Initial Stock", type: "number" },
                            {
                                name: "lowStockThreshold",
                                label: "Low Stock Threshold",
                                type: "number",
                            },
                        ].map((field) => (
                            <label key={field.name} className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">
                                    {field.label}
                                </span>
                                <input
                                    name={field.name}
                                    type={field.type}
                                    required={field.name !== "description"}
                                    min={field.type === "number" ? 0 : undefined}
                                    step={field.type === "number" ? "any" : undefined}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500"
                                />
                            </label>
                        ))}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
                            >
                                {isCreating ? "Saving..." : "Save Product"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Products
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your inventory and stock levels.
                    </p>
                </div>

                <span className="text-sm text-slate-500">
                    Total products: {total}
                </span>
            </div>

            <div className="mb-5">
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setPage(1);
                    }}
                    placeholder="Search by product name or SKU..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {isLoading ? (
                    <p className="p-8 text-center text-slate-500">
                        Loading products...
                    </p>
                ) : isError ? (
                    <div className="p-8 text-center">
                        <p className="mb-3 text-red-600">
                            Failed to load products.
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                        >
                            Try again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <p className="p-8 text-center text-slate-500">
                        No products found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Product</th>
                                    <th className="px-5 py-4 font-semibold">SKU</th>
                                    <th className="px-5 py-4 font-semibold">Stock</th>
                                    <th className="px-5 py-4 font-semibold">Selling Price</th>
                                    <th className="px-5 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {products.map((product) => {
                                    const outOfStock = product.stockQuantity === 0;
                                    const lowStock =
                                        product.stockQuantity <= product.lowStockThreshold;

                                    return (
                                        <tr key={product._id} className="hover:bg-slate-50">
                                            <td className="px-5 py-4 font-medium text-slate-900">
                                                {product.name}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {product.sku}
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                {product.stockQuantity}
                                            </td>
                                            <td className="px-5 py-4 text-slate-700">
                                                ৳{product.sellingPrice.toLocaleString()}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${outOfStock
                                                        ? "bg-red-100 text-red-700"
                                                        : lowStock
                                                            ? "bg-amber-100 text-amber-700"
                                                            : "bg-green-100 text-green-700"
                                                        }`}
                                                >
                                                    {outOfStock
                                                        ? "Out of stock"
                                                        : lowStock
                                                            ? "Low stock"
                                                            : "In stock"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                    Page {page} of {totalPages}
                </p>

                <div className="flex gap-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((current) => current - 1)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((current) => current + 1)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </main>
    );
}