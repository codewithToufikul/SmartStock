import { useState } from "react";
import {
    useGetSuppliersQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useArchiveSupplierMutation,
    type Supplier,
} from "./suppliers.api";

export default function SuppliersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const { data, isLoading, isError, refetch } = useGetSuppliersQuery({
        search: searchQuery.trim() || undefined,
    });

    const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
    const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
    const [archiveSupplier] = useArchiveSupplierMutation();

    const suppliers = data?.suppliers ?? [];

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const payload = {
            name: String(formData.get("name") ?? "").trim(),
            contactPerson: String(formData.get("contactPerson") ?? "").trim(),
            phone: String(formData.get("phone") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            address: String(formData.get("address") ?? "").trim(),
            notes: String(formData.get("notes") ?? "").trim(),
        };

        if (!payload.name) return;

        try {
            await createSupplier(payload).unwrap();
            setIsAddOpen(false);
            form.reset();
        } catch (err: unknown) {
            console.error("Failed to create supplier:", err);
            const maybeErr = err as { data?: { message?: string } };
            alert(maybeErr.data?.message || "Failed to create supplier");
        }
    }

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingSupplier) return;

        const formData = new FormData(e.currentTarget);
        const payload = {
            name: String(formData.get("name") ?? "").trim(),
            contactPerson: String(formData.get("contactPerson") ?? "").trim(),
            phone: String(formData.get("phone") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            address: String(formData.get("address") ?? "").trim(),
            notes: String(formData.get("notes") ?? "").trim(),
        };

        if (!payload.name) return;

        try {
            await updateSupplier({
                id: editingSupplier._id,
                body: payload,
            }).unwrap();
            setEditingSupplier(null);
        } catch (err: unknown) {
            console.error("Failed to update supplier:", err);
            const maybeErr = err as { data?: { message?: string } };
            alert(maybeErr.data?.message || "Failed to update supplier");
        }
    }

    async function handleArchive(supplier: Supplier) {
        if (!window.confirm(`Are you sure you want to archive supplier "${supplier.name}"?`)) {
            return;
        }

        try {
            await archiveSupplier(supplier._id).unwrap();
        } catch (err: unknown) {
            console.error("Failed to archive supplier:", err);
            const maybeErr = err as { data?: { message?: string } };
            alert(maybeErr.data?.message || "Cannot archive supplier");
        }
    }

    return (
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
            {/* Add Supplier Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form
                        onSubmit={handleCreate}
                        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                Add Supplier
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
                                className="text-xl text-slate-500 hover:text-slate-700"
                            >
                                ×
                            </button>
                        </div>

                        {[
                            { name: "name", label: "Supplier / Company Name", type: "text", required: true },
                            { name: "contactPerson", label: "Contact Person", type: "text" },
                            { name: "phone", label: "Phone Number", type: "text" },
                            { name: "email", label: "Email Address", type: "email" },
                            { name: "address", label: "Address", type: "text" },
                            { name: "notes", label: "Notes", type: "text" },
                        ].map((field) => (
                            <label key={field.name} className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">
                                    {field.label}
                                </span>
                                <input
                                    name={field.name}
                                    type={field.type}
                                    required={field.required}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>
                        ))}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {isCreating ? "Saving..." : "Save Supplier"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Supplier Modal */}
            {editingSupplier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form
                        onSubmit={handleUpdate}
                        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                Edit Supplier
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditingSupplier(null)}
                                className="text-xl text-slate-500 hover:text-slate-700"
                            >
                                ×
                            </button>
                        </div>

                        {[
                            { name: "name", label: "Supplier / Company Name", type: "text", required: true, defaultValue: editingSupplier.name },
                            { name: "contactPerson", label: "Contact Person", type: "text", defaultValue: editingSupplier.contactPerson || "" },
                            { name: "phone", label: "Phone Number", type: "text", defaultValue: editingSupplier.phone || "" },
                            { name: "email", label: "Email Address", type: "email", defaultValue: editingSupplier.email || "" },
                            { name: "address", label: "Address", type: "text", defaultValue: editingSupplier.address || "" },
                            { name: "notes", label: "Notes", type: "text", defaultValue: editingSupplier.notes || "" },
                        ].map((field) => (
                            <label key={field.name} className="block space-y-1">
                                <span className="text-sm font-medium text-slate-700">
                                    {field.label}
                                </span>
                                <input
                                    name={field.name}
                                    type={field.type}
                                    required={field.required}
                                    defaultValue={field.defaultValue}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                                />
                            </label>
                        ))}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingSupplier(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {isUpdating ? "Updating..." : "Update Supplier"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage vendor contacts and product suppliers.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Total: {suppliers.length}</span>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                        + Add Supplier
                    </button>
                </div>
            </div>

            <div className="mb-5">
                <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by supplier name, contact, phone, or email..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {isLoading ? (
                    <p className="p-8 text-center text-slate-500">Loading suppliers...</p>
                ) : isError ? (
                    <div className="p-8 text-center">
                        <p className="mb-3 text-red-600">Failed to load suppliers.</p>
                        <button
                            onClick={() => refetch()}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                        >
                            Try again
                        </button>
                    </div>
                ) : suppliers.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-slate-500 mb-3">No suppliers found.</p>
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Create first supplier
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Company / Name</th>
                                    <th className="px-5 py-4 font-semibold">Contact Person</th>
                                    <th className="px-5 py-4 font-semibold">Phone</th>
                                    <th className="px-5 py-4 font-semibold">Email</th>
                                    <th className="px-5 py-4 font-semibold">Address</th>
                                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {suppliers.map((supplier) => (
                                    <tr key={supplier._id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {supplier.name}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {supplier.contactPerson || "—"}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {supplier.phone || "—"}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {supplier.email || "—"}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {supplier.address || "—"}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingSupplier(supplier)}
                                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(supplier)}
                                                    className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 transition"
                                                >
                                                    Archive
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
