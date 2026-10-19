import { api } from "../../services/api";

export interface Category {
    _id: string;
    name: string;
    description?: string;
    workspace: string;
    isArchived: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoriesResponse {
    categories: Category[];
    total: number;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const categoriesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<
            CategoriesResponse,
            { includeArchived?: boolean } | void
        >({
            query: (params) => ({
                url: "/categories",
                params: params || undefined,
            }),
            transformResponse: (res: ApiResponse<CategoriesResponse>) => res.data,
            providesTags: ["Categories"],
        }),

        createCategory: builder.mutation<
            { category: Category },
            { name: string; description?: string }
        >({
            query: (body) => ({
                url: "/categories",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Categories", "Products"],
        }),

        updateCategory: builder.mutation<
            { category: Category },
            { id: string; body: { name?: string; description?: string } }
        >({
            query: ({ id, body }) => ({
                url: `/categories/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["Categories", "Products"],
        }),

        archiveCategory: builder.mutation<
            { category: Category; message: string },
            string
        >({
            query: (id) => ({
                url: `/categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Categories", "Products"],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useArchiveCategoryMutation,
} = categoriesApi;
