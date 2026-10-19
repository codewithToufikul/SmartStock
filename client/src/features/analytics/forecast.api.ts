import { api } from "../../services/api";

export interface DemandForecastItem {
    productId: string;
    name: string;
    sku: string;
    currentStock: number;
    totalUnitsSold: number;
    averageDailyDemand: number;
    estimatedDaysRemaining: number | null;
    lowStock: boolean;
    leadTimeDays?: number;
    safetyStock?: number;
    reorderPoint?: number;
    needsRestock?: boolean;
    suggestedRestock?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ForecastResponse {
    periodDays: number;
    forecasts: DemandForecastItem[];
}

export const forecastApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDemandForecast: builder.query<DemandForecastItem[], number | void>({
            query: (days = 30) =>
                `/sales/analytics/forecast?days=${days ?? 30}`,
            transformResponse: (response: ApiResponse<ForecastResponse>) =>
                response.data.forecasts,
            providesTags: ["Sales", "Products"],
        }),
    }),
});

export const { useGetDemandForecastQuery } = forecastApi;