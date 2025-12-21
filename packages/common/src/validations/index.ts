import { z } from "zod/v4";
import type { TradeSide } from "../types";

// Zod schema for validating trade creation input
export const createTradeSchema = z.object({
    symbol: z
        .string()
        .min(1, "Symbol is required")
        .max(10, "Symbol must be at most 10 characters")
        .transform((val) => val.toUpperCase()),

    side: z.enum(["BUY", "SELL"], {
        error: "Side must be either BUY or SELL",
    }),

    note: z.string().optional(),
});

// Type inference from the schema
export type CreateTradeInput = z.infer<typeof createTradeSchema>;
