import { api } from "../../services/api";

export interface DashboardSummary {
    totalProducts: number;
    totalStockUnits: number;
    lowStockCount: number;
    outOfStockCount: number;
    inventoryCostValue: number;
    potentialSellingValue: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const dashboardApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardSummary: builder.query<DashboardSummary, void>({
            query: () => "/dashboard/summary",
            transformResponse: (
                response: ApiResponse<{ summary: DashboardSummary }>,
            ) => response.data.summary,
            providesTags: ["Dashboard"],
        }),
    }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;