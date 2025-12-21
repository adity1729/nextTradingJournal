// Trade side enum - matches Prisma enum
export type TradeSide = "BUY" | "SELL";

// TradeScreenshot - matches Prisma model
export interface TradeScreenshot {
    id: number;      // Int in Prisma, not string
    tradeId: number;
    url: string;
}

// Trade - matches Prisma model
export interface Trade {
    id: number;
    uuid: string;
    userId: number;
    symbol: string;
    side: TradeSide;  // Direct enum, not an object
    createdAt: Date | string;
    updatedAt: Date | string;
    note?: string | null;
    screenshots?: TradeScreenshot[];
}

// API Response types
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
    details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

