import { api } from "../../services/api";

export interface Supplier {
    _id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    workspace: string;
    isArchived: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface SuppliersResponse {
    suppliers: Supplier[];
    total: number;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const suppliersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getSuppliers: builder.query<
            SuppliersResponse,
            { search?: string; includeArchived?: boolean } | void
        >({
            query: (params) => ({
                url: "/suppliers",
                params: params || undefined,
            }),
            transformResponse: (res: ApiResponse<SuppliersResponse>) => res.data,
            providesTags: ["Suppliers"],
        }),

        createSupplier: builder.mutation<
            { supplier: Supplier },
            {
                name: string;
                contactPerson?: string;
                phone?: string;
                email?: string;
                address?: string;
                notes?: string;
            }
        >({
            query: (body) => ({
                url: "/suppliers",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Suppliers", "Products"],
        }),

        updateSupplier: builder.mutation<
            { supplier: Supplier },
            {
                id: string;
                body: {
                    name?: string;
                    contactPerson?: string;
                    phone?: string;
                    email?: string;
                    address?: string;
                    notes?: string;
                };
            }
        >({
            query: ({ id, body }) => ({
                url: `/suppliers/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Suppliers", "Products"],
        }),

        archiveSupplier: builder.mutation<
            { supplier: Supplier; message: string },
            string
        >({
            query: (id) => ({
                url: `/suppliers/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Suppliers", "Products"],
        }),
    }),
});

export const {
    useGetSuppliersQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useArchiveSupplierMutation,
} = suppliersApi;
