import { z } from "zod/v4";

// Zod schema for validating trade creation input
// Updated to match new schema: removed quantity/price, note is optional
export const createTradeSchema = z.object({
    symbol: z
        .string()
        .min(1, "Symbol is required")
        .max(10, "Symbol must be at most 10 characters")
        .transform((val) => val.toUpperCase()), // Normalize to uppercase

    side: z.enum(["BUY", "SELL"], {
        error: "Side must be either BUY or SELL",
    }),

    note: z
        .string()
        .optional(), // Note is now optional
});

// Type inference from the schema
export type CreateTradeInput = z.infer<typeof createTradeSchema>;
