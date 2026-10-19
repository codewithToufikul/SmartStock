import { useState } from "react";
import type { Product } from "../products/products.api";
import {
    useCreateStockMovementMutation,
    useGetStockMovementHistoryQuery,
} from "./stock-movements.api";

interface StockMovementModalProps {
    product: Product;
    onClose: () => void;
    initialTab?: "movement" | "history";
}

export default function StockMovementModal({
    product,
    onClose,
    initialTab = "movement",
}: StockMovementModalProps) {
    const [activeTab, setActiveTab] = useState<"movement" | "history">(initialTab);
    const [movementType, setMovementType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
    const [quantity, setQuantity] = useState<number | "">("");
    const [newQuantity, setNewQuantity] = useState<number | "">(product.stockQuantity);
    const [reason, setReason] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [createMovement, { isLoading: isSubmitting }] = useCreateStockMovementMutation();
    const {
        data: historyData,
        isLoading: isHistoryLoading,
        refetch: refetchHistory,
    } = useGetStockMovementHistoryQuery(product._id);

    const movements = historyData?.data.movements ?? [];

    let resultingStock = product.stockQuantity;
    const numQty = typeof quantity === "number" ? quantity : 0;
    const numNewQty = typeof newQuantity === "number" ? newQuantity : product.stockQuantity;

    if (movementType === "IN") {
        resultingStock = product.stockQuantity + numQty;
    } else if (movementType === "OUT") {
        resultingStock = product.stockQuantity - numQty;
    } else if (movementType === "ADJUSTMENT") {
        resultingStock = numNewQty;
    }

    const quickReasons = {
        IN: ["Supplier Delivery", "Customer Return", "Found Inventory", "Bulk Purchase"],
        OUT: ["Damaged Goods", "Internal Usage", "Inventory Shrinkage", "Expired Items"],
        ADJUSTMENT: ["Physical Audit Reconciliation", "Counting Error Correction", "Initial Calibration"],
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!reason.trim()) {
            setErrorMessage("Please provide a reason for this stock adjustment.");
            return;
        }

        try {
            if (movementType === "IN") {
                if (typeof quantity !== "number" || quantity <= 0) {
                    setErrorMessage("Please enter a valid positive quantity to add.");
                    return;
                }
                await createMovement({
                    type: "IN",
                    productId: product._id,
                    quantity,
                    reason: reason.trim(),
                }).unwrap();
            } else if (movementType === "OUT") {
                if (typeof quantity !== "number" || quantity <= 0) {
                    setErrorMessage("Please enter a valid positive quantity to remove.");
                    return;
                }
                if (quantity > product.stockQuantity) {
                    setErrorMessage(`Cannot remove ${quantity} units. Only ${product.stockQuantity} currently available.`);
                    return;
                }
                await createMovement({
                    type: "OUT",
                    productId: product._id,
                    quantity,
                    reason: reason.trim(),
                }).unwrap();
            } else {
                if (typeof newQuantity !== "number" || newQuantity < 0) {
                    setErrorMessage("Please enter a valid non-negative new stock quantity.");
                    return;
                }
                if (newQuantity === product.stockQuantity) {
                    setErrorMessage("The new quantity is identical to the current stock.");
                    return;
                }
                await createMovement({
                    type: "ADJUSTMENT",
                    productId: product._id,
                    newQuantity,
                    reason: reason.trim(),
                }).unwrap();
            }

            setSuccessMessage("Stock adjustment recorded successfully!");
            setQuantity("");
            setReason("");
            refetchHistory();
            setTimeout(() => {
                setActiveTab("history");
            }, 600);
        } catch (err: any) {
            console.error("Failed to record stock movement:", err);
            setErrorMessage(err?.data?.message || "Failed to record stock movement. Please try again.");
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-slate-900">
                                Stock Management
                            </h2>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                                SKU: {product.sku}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                            {product.name}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        aria-label="Close"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3 text-center">
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-medium">Current Stock</span>
                        <p className="text-lg font-bold text-slate-900">{product.stockQuantity} units</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-medium">Low Stock Alert</span>
                        <p className="text-lg font-bold text-amber-600">{product.lowStockThreshold} units</p>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 uppercase font-medium">Stock Status</span>
                        <p className="mt-0.5">
                            {product.stockQuantity <= 0 ? (
                                <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                    Out of Stock
                                </span>
                            ) : product.stockQuantity <= product.lowStockThreshold ? (
                                <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                                    Low Stock
                                </span>
                            ) : (
                                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                    Optimal
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex border-b border-slate-200 px-6">
                    <button
                        onClick={() => setActiveTab("movement")}
                        className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === "movement"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        Adjust / Restock
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === "history"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                            }`}
                    >
                        Movement History ({movements.length})
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === "movement" ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {errorMessage && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
                                    {errorMessage}
                                </div>
                            )}

                            {successMessage && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700">
                                    {successMessage}
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Movement Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMovementType("IN");
                                            setErrorMessage("");
                                        }}
                                        className={`rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition ${movementType === "IN"
                                            ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold ring-2 ring-emerald-500/20"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        Stock In (+)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMovementType("OUT");
                                            setErrorMessage("");
                                        }}
                                        className={`rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition ${movementType === "OUT"
                                            ? "border-rose-600 bg-rose-50 text-rose-700 font-semibold ring-2 ring-rose-500/20"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        Stock Out (-)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMovementType("ADJUSTMENT");
                                            setErrorMessage("");
                                        }}
                                        className={`rounded-xl border px-3 py-2.5 text-center text-sm font-medium transition ${movementType === "ADJUSTMENT"
                                            ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-2 ring-blue-500/20"
                                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        Audit / Adjust (=)
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {movementType === "ADJUSTMENT" ? (
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">
                                            New Total Quantity
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={newQuantity}
                                            onChange={(e) =>
                                                setNewQuantity(e.target.value === "" ? "" : Number(e.target.value))
                                            }
                                            placeholder="Enter actual counted stock"
                                            required
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="mb-1 block text-sm font-semibold text-slate-700">
                                            {movementType === "IN" ? "Units to Add" : "Units to Deduct"}
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={movementType === "OUT" ? product.stockQuantity : undefined}
                                            value={quantity}
                                            onChange={(e) =>
                                                setQuantity(e.target.value === "" ? "" : Number(e.target.value))
                                            }
                                            placeholder="e.g. 10"
                                            required
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                )}

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-col justify-center">
                                    <span className="text-xs font-semibold text-slate-500 uppercase">
                                        Resulting Stock Preview
                                    </span>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-slate-900">
                                            {resultingStock}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500">
                                            ({product.stockQuantity}{" "}
                                            {movementType === "IN"
                                                ? `+ ${numQty}`
                                                : movementType === "OUT"
                                                    ? `- ${numQty}`
                                                    : `→ ${numNewQty}`}
                                            )
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Reason / Notes
                                </label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g. Restocked from supplier batch #482"
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs text-slate-500">Quick reasons:</span>
                                    {quickReasons[movementType].map((q) => (
                                        <button
                                            key={q}
                                            type="button"
                                            onClick={() => setReason(q)}
                                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 ${movementType === "IN"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : movementType === "OUT"
                                            ? "bg-rose-600 hover:bg-rose-700"
                                            : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {isSubmitting
                                        ? "Saving..."
                                        : movementType === "IN"
                                            ? "Confirm Stock In"
                                            : movementType === "OUT"
                                                ? "Confirm Stock Out"
                                                : "Save Audit Adjustment"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {isHistoryLoading ? (
                                <p className="py-8 text-center text-sm text-slate-500">
                                    Loading history...
                                </p>
                            ) : movements.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                                    <p className="text-sm font-medium text-slate-500">
                                        No stock movements recorded yet for this product.
                                    </p>
                                    <button
                                        onClick={() => setActiveTab("movement")}
                                        className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
                                    >
                                        Record the first movement
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Type</th>
                                                <th className="px-4 py-3 text-right">Change</th>
                                                <th className="px-4 py-3 text-right">Balance</th>
                                                <th className="px-4 py-3">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {movements.map((m) => {
                                                const delta = m.newQuantity - m.previousQuantity;
                                                const formattedDate = new Date(m.createdAt).toLocaleString(
                                                    "en-US",
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                );

                                                return (
                                                    <tr key={m._id} className="hover:bg-slate-50/50 transition">
                                                        <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                                                            {formattedDate}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {m.type === "IN" ? (
                                                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                                    IN
                                                                </span>
                                                            ) : m.type === "OUT" ? (
                                                                <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                                                                    OUT
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                                    ADJUST
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono font-bold text-xs whitespace-nowrap">
                                                            <span
                                                                className={
                                                                    delta > 0
                                                                        ? "text-emerald-600"
                                                                        : delta < 0
                                                                            ? "text-rose-600"
                                                                            : "text-slate-600"
                                                                }
                                                            >
                                                                {delta > 0 ? `+${delta}` : delta}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono text-xs text-slate-600 whitespace-nowrap">
                                                            {m.previousQuantity} → <strong className="text-slate-900">{m.newQuantity}</strong>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-slate-700 max-w-xs truncate" title={m.reason}>
                                                            {m.reason}
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
                </div>
            </div>
        </div>
    );
}
