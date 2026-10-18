import { api } from "../../services/api";

export interface LowStockProduct {
    _id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    lowStockThreshold: number;
    costPrice: number;
    sellingPrice: number;
}

interface LowStockResponse {
    products: LowStockProduct[];
    total: number;
}

export const productsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getLowStockProducts: builder.query<LowStockResponse, void>({
            query: () => "/products/low-stock",
            providesTags: ["Products"],
        }),
    }),
});

export const { useGetLowStockProductsQuery } = productsApi;