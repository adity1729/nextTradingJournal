// Types for the Trade Journal calendar UI
import { TradeSide } from "@repo/db/client";

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

export interface DayStats {
    totalProfit: number;
    profitableTrades: number;
    lossTrades: number;
    totalTrades: number;
}

export interface WeekTotal {
    weekNumber: number;
    total: number;
    tradingDays: number;
}

// Helper functions for trade calculations
export function getTradesByDate(trades: TradeWithScreenshots[], dateStr: string): TradeWithScreenshots[] {
    return trades.filter(trade => {
        const tradeDate = new Date(trade.tradeDate);
        const formatted = `${tradeDate.getFullYear()}-${String(tradeDate.getMonth() + 1).padStart(2, '0')}-${String(tradeDate.getDate()).padStart(2, '0')}`;
        return formatted === dateStr;
    });
}

export function getDayProfit(trades: TradeWithScreenshots[], dateStr: string): number {
    const dayTrades = getTradesByDate(trades, dateStr);
    return dayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
}

export function getDayStats(trades: TradeWithScreenshots[], dateStr: string): DayStats {
    const dayTrades = getTradesByDate(trades, dateStr);
    const profitableTrades = dayTrades.filter(t => t.profitLoss > 0).length;
    const lossTrades = dayTrades.filter(t => t.profitLoss < 0).length;

    return {
        totalProfit: dayTrades.reduce((sum, t) => sum + t.profitLoss, 0),
        profitableTrades,
        lossTrades,
        totalTrades: dayTrades.length
    };
}

export function formatCurrency(amount: number): string {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}$${Math.abs(amount).toLocaleString()}`;
}

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}
