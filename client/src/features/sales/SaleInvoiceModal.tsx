import type { Sale } from "./sales.api";

interface SaleInvoiceModalProps {
    sale: Sale;
    onClose: () => void;
}

export default function SaleInvoiceModal({ sale, onClose }: SaleInvoiceModalProps) {
    const isCancelled = sale.status === "CANCELLED";
    const invoiceNumber = sale.saleNumber || `INV-${sale._id.slice(-6).toUpperCase()}`;
    const soldByName =
        typeof sale.soldBy === "object" && sale.soldBy ? sale.soldBy.name : "Staff";

    const formattedDate = new Date(sale.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    function handlePrint() {
        window.print();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="flex max-h-[95vh] w-full max-w-xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
                {/* Print Controls Header (Hidden during actual print) */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 print:hidden">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Sales Receipt / Invoice
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition flex items-center gap-1.5"
                        >
                            Print Receipt
                        </button>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Container */}
                <div id="printable-invoice" className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    {/* Brand & Status Banner */}
                    <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm">
                                    S
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                    SmartStock Retail
                                </h2>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                                Inventory & Point of Sale System
                            </p>
                        </div>

                        <div className="text-right">
                            <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    isCancelled
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-emerald-100 text-emerald-700"
                                }`}
                            >
                                {isCancelled ? "CANCELLED / RETURNED" : "PAID & COMPLETED"}
                            </span>
                            <p className="mt-1 text-sm font-mono font-bold text-slate-800">
                                {invoiceNumber}
                            </p>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 rounded-xl p-3.5">
                        <div>
                            <span className="text-slate-400 uppercase font-semibold text-[10px]">Date & Time</span>
                            <p className="font-medium text-slate-800 mt-0.5">{formattedDate}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 uppercase font-semibold text-[10px]">Served By</span>
                            <p className="font-medium text-slate-800 mt-0.5">{soldByName}</p>
                        </div>
                    </div>

                    {/* Items List Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200 uppercase tracking-wide">
                                <tr>
                                    <th className="px-4 py-2.5">Item</th>
                                    <th className="px-4 py-2.5 text-center">Qty</th>
                                    <th className="px-4 py-2.5 text-right">Price</th>
                                    <th className="px-4 py-2.5 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sale.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-900">{item.name}</p>
                                            <p className="text-[10px] text-slate-500 font-mono">{item.sku}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-slate-700">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-600">
                                            ৳{item.unitPrice.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                                            ৳{item.lineTotal.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary Totals */}
                    <div className="space-y-1.5 border-t border-slate-200 pt-4 text-xs">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal</span>
                            <span className="font-semibold">৳{sale.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Tax / VAT (0%)</span>
                            <span>৳0.00</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                            <span>Grand Total</span>
                            <span className="text-base text-blue-600">৳{sale.total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Thank You Note */}
                    <div className="text-center pt-2 border-t border-dashed border-slate-200">
                        <p className="text-xs font-semibold text-slate-700">
                            Thank you for shopping with us!
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            Customer satisfaction is our highest priority.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
