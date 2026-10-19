import { api } from "../../services/api";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: "OWNER" | "STAFF";
    workspaceId: string;
}

export interface AuthResponseData {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponseData, LoginPayload>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            transformResponse: (response: ApiResponse<AuthResponseData>) => response.data,
            invalidatesTags: ["Auth", "Dashboard", "Products", "Sales"],
        }),

        register: builder.mutation<AuthResponseData, RegisterPayload>({
            query: (payload) => ({
                url: "/auth/register",
                method: "POST",
                body: payload,
            }),
            transformResponse: (response: ApiResponse<AuthResponseData>) => response.data,
            invalidatesTags: ["Auth", "Dashboard", "Products", "Sales"],
        }),

        getCurrentUser: builder.query<{ user: AuthUser }, void>({
            query: () => "/auth/me",
            transformResponse: (response: ApiResponse<{ user: AuthUser }>) => response.data,
            providesTags: ["Auth"],
        }),

        logout: builder.mutation<{ success: boolean }, void>({
            query: () => {
                const refreshToken = localStorage.getItem("refreshToken");
                return {
                    url: "/auth/logout",
                    method: "POST",
                    body: { refreshToken },
                };
            },
            invalidatesTags: ["Auth", "Dashboard", "Products", "Sales"],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetCurrentUserQuery,
    useLogoutMutation,
} = authApi;
