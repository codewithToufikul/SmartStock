import { useState } from "react";
import { useGetProductsQuery, type Product } from "../products/products.api";
import { useCreateSaleMutation, useGetSalesQuery, type Sale } from "./sales.api";

interface CartItem {
    product: Product;
    quantity: number;
}

export default function SalesPage() {
    const [activeTab, setActiveTab] = useState<"pos" | "history">("pos");
    const [searchQuery, setSearchQuery] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { data: productsData, isLoading: isLoadingProducts } = useGetProductsQuery();
    const { data: salesData, isLoading: isLoadingSales, refetch: refetchSales } = useGetSalesQuery();
    const [createSale, { isLoading: isCreatingSale }] = useCreateSaleMutation();

    const allProducts = productsData?.products ?? [];
    const salesList = salesData?.sales ?? [];

    const filteredProducts = allProducts.filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
    });

    function addToCart(product: Product) {
        if (product.stockQuantity <= 0) return;

        setCart((prev) => {
            const existing = prev.find((item) => item.product._id === product._id);
            if (existing) {
                if (existing.quantity >= product.stockQuantity) {
                    alert(`Cannot add more. Only ${product.stockQuantity} units available.`);
                    return prev;
                }
                return prev.map((item) =>
                    item.product._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    }

    function updateCartQuantity(productId: string, quantity: number) {
        const product = allProducts.find((p) => p._id === productId);
        if (!product) return;

        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (quantity > product.stockQuantity) {
            alert(`Maximum available stock is ${product.stockQuantity}`);
            quantity = product.stockQuantity;
        }

        setCart((prev) =>
            prev.map((item) =>
                item.product._id === productId ? { ...item, quantity } : item,
            ),
        );
    }

    function removeFromCart(productId: string) {
        setCart((prev) => prev.filter((item) => item.product._id !== productId));
    }

    function clearCart() {
        setCart([]);
    }

    const subtotal = cart.reduce(
        (sum, item) => sum + item.product.sellingPrice * item.quantity,
        0,
    );
    const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

    async function handleCompleteSale() {
        if (cart.length === 0) return;

        const payload = {
            items: cart.map((item) => ({
                productId: item.product._id,
                quantity: item.quantity,
            })),
        };

        try {
            const result = await createSale(payload).unwrap();
            setSuccessMessage(`Sale completed successfully! Total: ৳${result.sale.total.toLocaleString()}`);
            setCart([]);
            refetchSales();
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: unknown) {
            console.error("Sale error:", err);
            const maybeErr = err as { data?: { message?: string } };
            alert(maybeErr.data?.message || "Failed to process sale. Check stock levels.");
        }
    }

    return (
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Sales Management</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Process new customer sales and view past sales transactions.
                    </p>
                </div>

                <div className="flex rounded-xl bg-slate-200/70 p-1">
                    <button
                        onClick={() => setActiveTab("pos")}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === "pos"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        New Sale (POS)
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${activeTab === "history"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                            }`}
                    >
                        Sales History ({salesList.length})
                    </button>
                </div>
            </div>

            {successMessage && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="text-emerald-700 font-bold"
                    >
                        ✕
                    </button>
                </div>
            )}

            {activeTab === "pos" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products by name or SKU..."
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {isLoadingProducts ? (
                            <p className="p-8 text-center text-slate-500">Loading products...</p>
                        ) : filteredProducts.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 bg-white">
                                No products found matching your search.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[650px] overflow-y-auto pr-1">
                                {filteredProducts.map((product) => {
                                    const outOfStock = product.stockQuantity <= 0;
                                    const cartItem = cart.find(
                                        (item) => item.product._id === product._id,
                                    );
                                    const cartQty = cartItem?.quantity ?? 0;
                                    const availableLeft = product.stockQuantity - cartQty;

                                    return (
                                        <div
                                            key={product._id}
                                            className={`rounded-xl border p-4 transition bg-white flex flex-col justify-between ${outOfStock
                                                ? "border-slate-200 opacity-60"
                                                : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                                                }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                                                        {product.name}
                                                    </h3>
                                                    <span className="text-xs font-mono text-slate-400">
                                                        {product.sku}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    {typeof product.category === "object" && product.category?.name
                                                        ? product.category.name
                                                        : "General"}
                                                </p>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
                                                <div>
                                                    <span className="text-base font-bold text-slate-900">
                                                        ৳{product.sellingPrice.toLocaleString()}
                                                    </span>
                                                    <p className="text-[11px] text-slate-500">
                                                        {outOfStock ? (
                                                            <span className="text-red-600 font-semibold">Out of Stock</span>
                                                        ) : (
                                                            <span>Stock: {availableLeft} left</span>
                                                        )}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={outOfStock || availableLeft <= 0}
                                                    onClick={() => addToCart(product)}
                                                    className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition disabled:opacity-40 disabled:hover:bg-blue-50 disabled:hover:text-blue-600"
                                                >
                                                    + Add
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sticky top-20 flex flex-col h-[650px]">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Current Sale
                                </h2>
                                {cart.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className="text-xs text-red-600 hover:underline"
                                    >
                                        Clear Cart
                                    </button>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto py-3 space-y-3 divide-y divide-slate-100">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                                        <p>No items added yet</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Select products from the left to start a sale
                                        </p>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.product._id} className="pt-2 first:pt-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                                                        {item.product.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-500">
                                                        ৳{item.product.sellingPrice.toLocaleString()} each
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.product._id)}
                                                    className="text-slate-400 hover:text-red-600 text-sm"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartQuantity(item.product._id, item.quantity - 1)}
                                                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={item.product.stockQuantity}
                                                        value={item.quantity}
                                                        onChange={(e) => updateCartQuantity(item.product._id, Number(e.target.value))}
                                                        className="w-12 text-center text-xs outline-none font-semibold text-slate-800"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCartQuantity(item.product._id, item.quantity + 1)}
                                                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <span className="text-sm font-bold text-slate-900">
                                                    ৳{(item.product.sellingPrice * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <div className="space-y-1.5 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Total Units</span>
                                        <span className="font-semibold text-slate-800">{totalUnits}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
                                        <span>Grand Total</span>
                                        <span className="text-blue-600">৳{subtotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={cart.length === 0 || isCreatingSale}
                                    onClick={handleCompleteSale}
                                    className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition"
                                >
                                    {isCreatingSale ? "Processing Sale..." : `Complete Sale (৳${subtotal.toLocaleString()})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "history" && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {isLoadingSales ? (
                        <p className="p-8 text-center text-slate-500">Loading sales history...</p>
                    ) : salesList.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            No sales recorded yet. Process your first sale in the New Sale tab.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-600">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold">Sale Reference / Date</th>
                                        <th className="px-5 py-4 font-semibold">Cashier / Sold By</th>
                                        <th className="px-5 py-4 font-semibold">Items</th>
                                        <th className="px-5 py-4 font-semibold">Total Amount</th>
                                        <th className="px-5 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {salesList.map((sale) => {
                                        const soldByName =
                                            typeof sale.soldBy === "object" && sale.soldBy?.name
                                                ? sale.soldBy.name
                                                : "Staff";
                                        const dateStr = new Date(sale.createdAt).toLocaleString();
                                        const totalUnitsInSale = sale.items.reduce(
                                            (sum, i) => sum + i.quantity,
                                            0,
                                        );

                                        return (
                                            <tr key={sale._id} className="hover:bg-slate-50">
                                                <td className="px-5 py-4">
                                                    <p className="font-mono text-xs text-slate-500">
                                                        #{sale._id.slice(-6).toUpperCase()}
                                                    </p>
                                                    <p className="text-xs text-slate-700 mt-0.5">
                                                        {dateStr}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 font-medium text-slate-800">
                                                    {soldByName}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    {sale.items.length} product(s) ({totalUnitsInSale} pcs)
                                                </td>
                                                <td className="px-5 py-4 font-bold text-slate-900">
                                                    ৳{sale.total.toLocaleString()}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedSale(sale)}
                                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition"
                                                    >
                                                        View Receipt
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {selectedSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Sale Receipt</h3>
                                <p className="text-xs font-mono text-slate-500">
                                    ID: #{selectedSale._id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="text-xl text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        </div>

                        <div className="text-xs text-slate-500 flex justify-between">
                            <span>Date: {new Date(selectedSale.createdAt).toLocaleString()}</span>
                            <span>
                                Cashier:{" "}
                                {typeof selectedSale.soldBy === "object" && selectedSale.soldBy?.name
                                    ? selectedSale.soldBy.name
                                    : "Owner/Staff"}
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 border-y border-slate-100 py-2">
                            {selectedSale.items.map((item, idx) => (
                                <div key={idx} className="py-2 flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-slate-900">{item.name}</p>
                                        <p className="text-xs text-slate-500">
                                            {item.quantity} × ৳{item.unitPrice.toLocaleString()} ({item.sku})
                                        </p>
                                    </div>
                                    <span className="font-semibold text-slate-800">
                                        ৳{item.lineTotal.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-bold text-slate-700">Total Paid</span>
                            <span className="text-xl font-bold text-blue-600">
                                ৳{selectedSale.total.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={() => setSelectedSale(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
