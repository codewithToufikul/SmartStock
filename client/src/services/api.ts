import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem("accessToken");

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            return headers;
        },
    }),
    tagTypes: ["Dashboard", "Products", "Sales"],
    endpoints: () => ({}),
});