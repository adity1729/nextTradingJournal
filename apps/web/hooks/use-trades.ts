"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getTradesApi } from "@/lib/api/trades";

// Helper to calculate adjacent months
function getAdjacentMonths(year: number, month: number) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    return { prevMonth, prevYear, nextMonth, nextYear };
}

export function useTrades(year: number, month: number) {
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
    });

    // Prefetch adjacent months whenever the current month changes
    useEffect(() => {
        const { prevMonth, prevYear, nextMonth, nextYear } = getAdjacentMonths(year, month);

        // Prefetch previous month (for backward navigation)
        queryClient.prefetchQuery({
            queryKey: ["trades", prevYear, prevMonth],
            queryFn: async () => {
                const response = await getTradesApi(prevYear, prevMonth);
                if (!response.success) {
                    throw new Error(response.error);
                }
                return response.data;
            },
            staleTime: 5 * 60 * 1000,
        });

        // Prefetch next month (for forward navigation)
        queryClient.prefetchQuery({
            queryKey: ["trades", nextYear, nextMonth],
            queryFn: async () => {
                const response = await getTradesApi(nextYear, nextMonth);
                if (!response.success) {
                    throw new Error(response.error);
                }
                return response.data;
            },
            staleTime: 5 * 60 * 1000,
        });
    }, [year, month, queryClient]);

    return {
        trades: query.data?.trades ?? [],
        hasMore: query.data?.hasMore ?? false,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
    };
}