// Trade side enum - matches Prisma enum
export type TradeSide = "BUY" | "SELL";

// TradeScreenshot - matches Prisma model
export interface TradeScreenshot {
    id: number;      // Int in Prisma, not string
    tradeId: number;
    key: string;
}

// Trade - matches Prisma model
export interface Trade {
    id: number;
    uuid: string;
    userId: number;
    symbol: string;
    side: TradeSide;  // Direct enum, not an object
    tradeDate: Date | string;
    profitLoss: number;
    createdAt: Date | string;
    updatedAt: Date | string;
    note?: string | null;
    screenshots?: TradeScreenshot[];
}

// Trade with screenshots included (for queries with include)
export interface TradeWithScreenshots {
    id: number;
    uuid: string;
    userId: number;
    symbol: string;
    side: TradeSide;
    tradeDate: Date;
    profitLoss: number;
    createdAt: Date;
    updatedAt: Date;
    note: string | null;
    screenshots: {
        id: number;
        url: string;
    }[];
}

// Day statistics for calendar view
export interface DayStats {
    totalProfit: number;
    profitableTrades: number;
    lossTrades: number;
    totalTrades: number;
}

// Weekly totals for sidebar
export interface WeekTotal {
    weekNumber: number;
    total: number;
    tradingDays: number;
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

export interface ScreenShotInput {
    file: File
}

// Input type for adding a trade via API
export interface AddTradeInput {
    symbol: string;
    side: TradeSide;
    tradeDate: string; // ISO date string
    profitLoss: number;
    note?: string;
    screenshots?: ScreenShotInput[];
}

// Input type for updating a trade via API
export interface UpdateTradeInput {
    symbol?: string;
    side?: TradeSide;
    tradeDate?: string;
    profitLoss?: number;
    note?: string;
}


export interface GetTradesQuery {
    year: number;
    month: number;
}

export interface PaginatedTradesResponse {
    trades: TradeWithScreenshots[];
    year: number;
    month: number;
    hasMore: boolean;
}