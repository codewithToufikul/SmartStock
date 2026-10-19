import { useState } from "react";
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useArchiveCategoryMutation,
    type Category,
} from "./categories.api";

export default function CategoriesPage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, isLoading, isError, refetch } = useGetCategoriesQuery();
    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [archiveCategory] = useArchiveCategoryMutation();

    const categories = data?.categories ?? [];

    async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const name = String(formData.get("name") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();

        if (!name) return;

        try {
            await createCategory({ name, description }).unwrap();
            setIsAddOpen(false);
            form.reset();
        } catch (err: unknown) {
            console.error("Failed to create category:", err);
            const maybeErr = err as { data?: { message?: string } };
            alert(maybeErr.data?.message || "Failed to create category");
        }
    }

    async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingCategory) return;

        const formData = new FormData(e.currentTarget);
        const name = String(formData.get("name") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();

        if (!name) return;

        try {
            await updateCategory({
                id: editingCategory._id,
                body: { name, description },
            }).unwrap();
            setEditingCategory(null);
        } catch (err: unknown) {
            console.error("Failed to update category:", err);
            const maybeErr = err as { data?: { message?: string } };
            alert(maybeErr.data?.message || "Failed to update category");
        }
    }

    async function handleArchive(category: Category) {
        if (!window.confirm(`Are you sure you want to archive category "${category.name}"?`)) {
            return;
        }

        try {
            await archiveCategory(category._id).unwrap();
        } catch (err: unknown) {
            console.error("Failed to archive category:", err);
            const maybeErr = err as { data?: { message?: string } };
            alert(maybeErr.data?.message || "Cannot archive category");
        }
    }

    return (
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
            {/* Add Category Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form
                        onSubmit={handleCreate}
                        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                Add Category
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsAddOpen(false)}
                                className="text-xl text-slate-500 hover:text-slate-700"
                            >
                                ×
                            </button>
                        </div>

                        <label className="block space-y-1">
                            <span className="text-sm font-medium text-slate-700">Category Name</span>
                            <input
                                name="name"
                                required
                                placeholder="e.g. Electronics, Clothing"
                                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 outline-none focus:border-blue-500"
                            />
                        </label>

                        <label className="block space-y-1">
                            <span className="text-sm font-medium text-slate-700">Description (Optional)</span>
                            <textarea
                                name="description"
                                rows={3}
                                placeholder="Short description of this category"
                                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 outline-none focus:border-blue-500"
                            />
                        </label>

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
                                {isCreating ? "Saving..." : "Save Category"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form
                        onSubmit={handleUpdate}
                        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">
                                Edit Category
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="text-xl text-slate-500 hover:text-slate-700"
                            >
                                ×
                            </button>
                        </div>

                        <label className="block space-y-1">
                            <span className="text-sm font-medium text-slate-700">Category Name</span>
                            <input
                                name="name"
                                defaultValue={editingCategory.name}
                                required
                                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 outline-none focus:border-blue-500"
                            />
                        </label>

                        <label className="block space-y-1">
                            <span className="text-sm font-medium text-slate-700">Description (Optional)</span>
                            <textarea
                                name="description"
                                rows={3}
                                defaultValue={editingCategory.description || ""}
                                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 outline-none focus:border-blue-500"
                            />
                        </label>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {isUpdating ? "Updating..." : "Update Category"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Organize your products into distinct categories.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Total: {categories.length}</span>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                    >
                        + Add Category
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {isLoading ? (
                    <p className="p-8 text-center text-slate-500">Loading categories...</p>
                ) : isError ? (
                    <div className="p-8 text-center">
                        <p className="mb-3 text-red-600">Failed to load categories.</p>
                        <button
                            onClick={() => refetch()}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                        >
                            Try again
                        </button>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-slate-500 mb-3">No categories found yet.</p>
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            Create first category
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">Category Name</th>
                                    <th className="px-5 py-4 font-semibold">Description</th>
                                    <th className="px-5 py-4 font-semibold">Status</th>
                                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {categories.map((category) => (
                                    <tr key={category._id} className="hover:bg-slate-50">
                                        <td className="px-5 py-4 font-medium text-slate-900">
                                            {category.name}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {category.description || "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingCategory(category)}
                                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(category)}
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
