import { api } from "../../services/api";

export interface SaleItem {
    product: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    lineTotal: number;
}

export interface Sale {
    _id: string;
    workspace: string;
    soldBy: {
        _id: string;
        name: string;
        email: string;
    } | string;
    items: SaleItem[];
    subtotal: number;
    total: number;
    createdAt: string;
    updatedAt: string;
}

export interface SalesResponse {
    sales: Sale[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface CreateSalePayload {
    items: Array<{
        productId: string;
        quantity: number;
    }>;
}

export const salesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getSales: builder.query<SalesResponse, { page?: number; limit?: number } | void>({
            query: (params) => ({
                url: "/sales",
                params: params || undefined,
            }),
            transformResponse: (res: ApiResponse<SalesResponse>) => res.data,
            providesTags: ["Sales"],
        }),

        getSaleById: builder.query<{ sale: Sale }, string>({
            query: (saleId) => `/sales/${saleId}`,
            transformResponse: (res: ApiResponse<{ sale: Sale }>) => res.data,
            providesTags: ["Sales"],
        }),

        createSale: builder.mutation<{ sale: Sale }, CreateSalePayload>({
            query: (body) => ({
                url: "/sales",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Sales", "Products", "Dashboard"],
        }),
    }),
});

export const {
    useGetSalesQuery,
    useGetSaleByIdQuery,
    useCreateSaleMutation,
} = salesApi;
