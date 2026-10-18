import { api } from "../../services/api";

export interface DailySalesItem {
    date: string;
    revenue: number;
    unitsSold: number;
    grossProfit: number;
    salesCount: number;
}

export const salesAnalyticsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDailySales: builder.query<DailySalesItem[], number>({
            query: (days) => `/sales/analytics/daily?days=${days}`,
            providesTags: ["Sales"],
        }),
    }),
});

export const { useGetDailySalesQuery } = salesAnalyticsApi;