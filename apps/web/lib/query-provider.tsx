"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode, useState } from "react"

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                gcTime: 30 * 60 * 1000,
                retry: 1
            }
        }
    }
    ))

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

// ❌ Do NOT create QueryClient directly (e.g. `const queryClient = new QueryClient()`)
// In Next.js, components can re-render and module code can run multiple times.
// Creating it directly would recreate the client on each render,
// which resets the React Query cache and causes unnecessary refetches.

// ✅ useState ensures QueryClient is created only once per browser session
// and reused across re-renders, keeping the cache stable.

