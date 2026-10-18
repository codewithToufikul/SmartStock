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

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Product {
    _id: string;
    name: string;
    sku: string;
    description?: string;
    costPrice: number;
    sellingPrice: number;
    stockQuantity: number;
    lowStockThreshold: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductsResponse {
    products: Product[];
    total: number;
}

export interface GetProductsParams {
    page?: number;
    limit?: number;
    searchQuery?: string;
}

export const productsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getLowStockProducts: builder.query<LowStockResponse, void>({
            query: () => "/products/low-stock",
            transformResponse: (response: ApiResponse<LowStockResponse>) =>
                response.data,
            providesTags: ["Products"],
        }),
        getProducts: builder.query<
            ProductsResponse,
            GetProductsParams | void
        >({
            query: (params) => ({
                url: "/products",
                params: params ? params : undefined,
            }),
            transformResponse: (response: ApiResponse<ProductsResponse>) =>
                response.data,
            providesTags: ["Products"],
        }),
        createProduct: builder.mutation<
            { product: Product },
            {
                name: string;
                sku: string;
                description?: string;
                costPrice: number;
                sellingPrice: number;
                stockQuantity: number;
                lowStockThreshold: number;
            }
        >({
            query: (body) => ({
                url: "/products",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Products", "Dashboard"],
        }),
    }),
});

export const {
    useGetLowStockProductsQuery,
    useGetProductsQuery,
    useCreateProductMutation
} = productsApi;