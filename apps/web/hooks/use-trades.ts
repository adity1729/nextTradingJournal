"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getTradesApi } from "@/lib/api/trades";
import type { TradeWithScreenshots, PaginatedTradesResponse } from "@repo/common/types";
interface UseTradesOptions {
    initialData?: PaginatedTradesResponse;
}
export function useTrades(
    year: number,
    month: number,
    options?: UseTradesOptions
) {
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ["trades", year, month],
        queryFn: async () => {
            const response = await getTradesApi(year, month);
            if (!response.success) {
                throw new Error(response.error);
            }
            return response.data;
        },
        initialData: options?.initialData,
        initialDataUpdatedAt: options?.initialData ? Date.now() : undefined,
    });
    // Prefetch previous month when current month data loads
    useEffect(() => {
        if (query.data) {
            const prevMonth = month === 1 ? 12 : month - 1;
            const prevYear = month === 1 ? year - 1 : year;
            queryClient.prefetchQuery({
                queryKey: ["trades", prevYear, prevMonth],
                queryFn: async () => {
                    const response = await getTradesApi(prevYear, prevMonth);
                    if (!response.success) {
                        throw new Error(response.error);
                    }
                    return response.data;
                },
            });
        }
    }, [query.data, year, month, queryClient]);
    return {
        trades: query.data?.trades ?? [],
        hasMore: query.data?.hasMore ?? false,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
    };
}