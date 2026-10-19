import { useState } from "react";
import {
    useCreateProductMutation,
    useGetProductsQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
    type Product,
} from "./products.api";
import { useGetCategoriesQuery } from "../categories/categories.api";
import { useGetSuppliersQuery } from "../suppliers/suppliers.api";

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [createProduct, { isLoading: isCreating }] =
        useCreateProductMutation();

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [updateProduct, { isLoading: isUpdating }] =
        useUpdateProductMutation();

    const [deleteProduct] = useDeleteProductMutation();

    const { data: categoriesData } = useGetCategoriesQuery();
    const { data: suppliersData } = useGetSuppliersQuery();

    const categoriesList = categoriesData?.categories ?? [];
    const suppliersList = suppliersData?.suppliers ?? [];

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

        const categoryVal = String(formData.get("category") ?? "").trim();
        const supplierVal = String(formData.get("supplier") ?? "").trim();

        const payload = {
            name: String(formData.get("name") ?? "").trim(),
            sku: String(formData.get("sku") ?? "").trim(),
            description: String(formData.get("description") ?? "").trim(),
            costPrice: Number(formData.get("costPrice")),
            sellingPrice: Number(formData.get("sellingPrice")),
            stockQuantity: Number(formData.get("stockQuantity")),
            lowStockThreshold: Number(formData.get("lowStockThreshold")),
            category: categoryVal || null,
            supplier: supplierVal || null,
            leadTimeDays: Number(formData.get("leadTimeDays") || 0),
            safetyStock: Number(formData.get("safetyStock") || 0),
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

    async function handleUpdateProduct(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!editingProduct) return;

        const formData = new FormData(event.currentTarget);

        const categoryVal = String(formData.get("category") ?? "").trim();
        const supplierVal = String(formData.get("supplier") ?? "").trim();

        const body = {
            name: String(formData.get("name") ?? "").trim(),
            sku: String(formData.get("sku") ?? "").trim(),
            description: String(formData.get("description") ?? "").trim(),
            costPrice: Number(formData.get("costPrice")),
            sellingPrice: Number(formData.get("sellingPrice")),
            stockQuantity: Number(formData.get("stockQuantity")),
            lowStockThreshold: Number(formData.get("lowStockThreshold")),
            category: categoryVal || null,
            supplier: supplierVal || null,
            leadTimeDays: Number(formData.get("leadTimeDays") || 0),
            safetyStock: Number(formData.get("safetyStock") || 0),
        };

        try {
            await updateProduct({
                productId: editingProduct._id,
                body,
            }).unwrap();

            setEditingProduct(null);
        } catch (error) {
            console.error("Failed to update product:", error);
            alert("Product update করা যায়নি। Server error চেক করো।");
        }
    }

    async function handleDeleteProduct(productId: string, name: string) {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            await deleteProduct(productId).unwrap();
        } catch (error) {
            console.error("Failed to delete product:", error);
            alert("Product delete করা যায়নি।");
        }
    }

    return (
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
            {/* Add Product Modal */}
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
                                className="text-xl text-slate-500 hover:text-slate-700"
                                aria-label="Close form"
                            >
                                ×
                            </button>
                        </div>

                        {[
                            { name: "name", label: "Product Name", type: "text" },
                            { name: "sku", label: "SKU", type: "text" },
                            { name: "description", label: "Description", type: "text" },
                            { name: "costPrice", label: "Cost Price (৳)", type: "number" },
                            { name: "sellingPrice", label: "Selling Price (৳)", type: "number" },
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
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>
                        ))}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Category</span>
                                <select
                                    name="category"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="">No Category</option>
                                    {categoriesList.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Supplier</span>
                                <select
                                    name="supplier"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="">No Supplier</option>
                                    {suppliersList.map((sup) => (
                                        <option key={sup._id} value={sup._id}>
                                            {sup.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Lead Time (Days)</span>
                                <input
                                    name="leadTimeDays"
                                    type="number"
                                    min={0}
                                    defaultValue={0}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>

                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Safety Stock</span>
                                <input
                                    name="safetyStock"
                                    type="number"
                                    min={0}
                                    defaultValue={0}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {isCreating ? "Saving..." : "Save Product"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form
                        onSubmit={handleUpdateProduct}
                        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                Edit Product
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditingProduct(null)}
                                className="text-xl text-slate-500 hover:text-slate-700"
                                aria-label="Close edit form"
                            >
                                ×
                            </button>
                        </div>

                        {[
                            { name: "name", label: "Product Name", type: "text", defaultValue: editingProduct.name },
                            { name: "sku", label: "SKU", type: "text", defaultValue: editingProduct.sku },
                            { name: "description", label: "Description", type: "text", defaultValue: editingProduct.description || "" },
                            { name: "costPrice", label: "Cost Price (৳)", type: "number", defaultValue: editingProduct.costPrice },
                            { name: "sellingPrice", label: "Selling Price (৳)", type: "number", defaultValue: editingProduct.sellingPrice },
                            { name: "stockQuantity", label: "Stock Quantity", type: "number", defaultValue: editingProduct.stockQuantity },
                            {
                                name: "lowStockThreshold",
                                label: "Low Stock Threshold",
                                type: "number",
                                defaultValue: editingProduct.lowStockThreshold,
                            },
                        ].map((field) => (
                            <label key={field.name} className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">
                                    {field.label}
                                </span>
                                <input
                                    name={field.name}
                                    type={field.type}
                                    defaultValue={field.defaultValue}
                                    required={field.name !== "description"}
                                    min={field.type === "number" ? 0 : undefined}
                                    step={field.type === "number" ? "any" : undefined}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>
                        ))}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Category</span>
                                <select
                                    name="category"
                                    defaultValue={
                                        typeof editingProduct.category === "object" && editingProduct.category
                                            ? editingProduct.category._id
                                            : (editingProduct.category as string) || ""
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="">No Category</option>
                                    {categoriesList.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Supplier</span>
                                <select
                                    name="supplier"
                                    defaultValue={
                                        typeof editingProduct.supplier === "object" && editingProduct.supplier
                                            ? editingProduct.supplier._id
                                            : (editingProduct.supplier as string) || ""
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500 bg-white"
                                >
                                    <option value="">No Supplier</option>
                                    {suppliersList.map((sup) => (
                                        <option key={sup._id} value={sup._id}>
                                            {sup.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Lead Time (Days)</span>
                                <input
                                    name="leadTimeDays"
                                    type="number"
                                    min={0}
                                    defaultValue={editingProduct.leadTimeDays ?? 0}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>

                            <label className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">Safety Stock</span>
                                <input
                                    name="safetyStock"
                                    type="number"
                                    min={0}
                                    defaultValue={editingProduct.safetyStock ?? 0}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingProduct(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {isUpdating ? "Updating..." : "Update Product"}
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

                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">
                        Total products: {total}
                    </span>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                        + Add Product
                    </button>
                </div>
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
                                    <th className="px-5 py-4 font-semibold">Category</th>
                                    <th className="px-5 py-4 font-semibold">SKU</th>
                                    <th className="px-5 py-4 font-semibold">Stock</th>
                                    <th className="px-5 py-4 font-semibold">Selling Price</th>
                                    <th className="px-5 py-4 font-semibold">Status</th>
                                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
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
                                                {typeof product.category === "object" && product.category?.name
                                                    ? product.category.name
                                                    : "—"}
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
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingProduct(product)}
                                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product._id, product.name)}
                                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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