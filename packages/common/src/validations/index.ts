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

// Schema for adding trade via calendar (includes date & P/L)
export const addTradeSchema = z.object({
    symbol: z
        .string()
        .min(1, "Symbol is required")
        .max(10, "Symbol must be at most 10 characters")
        .transform((val) => val.toUpperCase()),

    side: z.enum(["BUY", "SELL"], {
        error: "Side must be either BUY or SELL",
    }),

    tradeDate: z.string().min(1, "Trade date is required"),

    profitLoss: z.number({
        error: "Profit/Loss must be a number",
    }),

    note: z.string().optional(),
});

// Schema for updating trade (all fields optional)
export const updateTradeSchema = z.object({
    symbol: z
        .string()
        .min(1)
        .max(10)
        .transform((val) => val.toUpperCase())
        .optional(),

    side: z.enum(["BUY", "SELL"]).optional(),

    tradeDate: z.string().optional(),

    profitLoss: z.number().optional(),

    note: z.string().optional(),
});

export type AddTradeSchemaInput = z.infer<typeof addTradeSchema>;
export type UpdateTradeSchemaInput = z.infer<typeof updateTradeSchema>;
