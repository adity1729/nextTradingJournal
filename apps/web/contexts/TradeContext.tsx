"use client"

export interface Trade {
    id: string;
    trade_name: string;
    profit_loss: number;
    trade_date: string;
    notes?: string;
    screenshots?: string;
    created_at: string;
    updated_at: string;
}

export interface NewTrade {
    trade_name: string;
    profit_loss: string;
    trade_date: string;
    notes?: string;
    screenshot_url?: string;
}

export interface DayStats {
    totalProfit: number;
    profitableTrades: number;
    lossTrades: number;
    totalTrades: number;
}

interface TradesContextType {
    trades: Trade[];
    loading: boolean;
    addTrade: (newTrade: Trade) => Promise<Trade | null>;
    updateTrade: (id: string, updates: Partial<Trade>) => Promise<Trade | null>;
    deleteTrade: (id: string) => Promise<void>;
    uploadScreeshot: (file: File) => Promise<string | null>;
    getTradesByDate: (date: string) => Trade[];
    getDayProfit: (date: string) => number;
    getDaysStats: (date: string) => DayStats;
    refetch: Promise<void>;
}


