import { api } from "../../services/api";

export interface DailySalesItem {
    date: string;
    revenue: number;
    unitsSold: number;
    grossProfit: number;
    salesCount: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface DailySalesResponse {
    days: number;
    dailySales: DailySalesItem[];
}

export const salesAnalyticsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDailySales: builder.query<DailySalesItem[], number | void>({
            query: (days = 7) => `/sales/analytics/daily?days=${days ?? 7}`,
            transformResponse: (response: ApiResponse<DailySalesResponse>) =>
                response.data.dailySales,
            providesTags: ["Sales"],
        }),
    }),
});

export const { useGetDailySalesQuery } = salesAnalyticsApi;