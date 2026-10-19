import { api } from "../../services/api";

export interface StockMovementItem {
    _id: string;
    product: string;
    workspace: string;
    performedBy: {
        _id: string;
        name: string;
        email: string;
    } | null;
    type: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reason: string;
    createdAt: string;
}

export type CreateStockMovementInput =
    | {
          type: "IN";
          productId: string;
          quantity: number;
          reason: string;
      }
    | {
          type: "OUT";
          productId: string;
          quantity: number;
          reason: string;
      }
    | {
          type: "ADJUSTMENT";
          productId: string;
          newQuantity: number;
          reason: string;
      };

export interface StockMovementResponse {
    success: boolean;
    message: string;
    data: {
        movement: {
            movementId: string;
            productId: string;
            type: "IN" | "OUT" | "ADJUSTMENT";
            previousQuantity: number;
            newQuantity: number;
            quantity: number;
        };
    };
}

export interface StockMovementHistoryResponse {
    success: boolean;
    message: string;
    data: {
        movements: StockMovementItem[];
        total: number;
    };
}

export const stockMovementsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createStockMovement: builder.mutation<
            StockMovementResponse,
            CreateStockMovementInput
        >({
            query: (body) => ({
                url: "/stock-movements",
                method: "POST",
                body,
            }),
            invalidatesTags: ["StockMovements", "Products", "Dashboard"],
        }),

        getStockMovementHistory: builder.query<
            StockMovementHistoryResponse,
            string
        >({
            query: (productId) => `/stock-movements/${productId}/history`,
            providesTags: ["StockMovements"],
        }),
    }),
});

export const {
    useCreateStockMovementMutation,
    useGetStockMovementHistoryQuery,
} = stockMovementsApi;
