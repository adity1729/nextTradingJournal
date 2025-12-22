"use client";

import { useState } from "react";
import { X, TrendingUp, TrendingDown, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TradeWithScreenshots } from "@/types/trade";
import { formatCurrency } from "@/lib/trade-utils";
import { deleteTrade } from "@/app/trades/actions";

interface TradeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    trades: TradeWithScreenshots[];
}

export default function TradeDetailModal({ isOpen, onClose, date, trades }: TradeDetailModalProps) {
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    if (!isOpen) return null;

    const totalProfit = trades.reduce((sum, t) => sum + t.profitLoss, 0);
    const isPositive = totalProfit >= 0;
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleDelete = async (tradeId: number) => {
        setIsDeleting(tradeId);
        try {
            await deleteTrade(tradeId);
            // Page will revalidate automatically
        } catch (error) {
            console.error("Failed to delete trade:", error);
        }
        setIsDeleting(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <Card className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-hidden bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl mx-4">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">
                                {formattedDate}
                            </CardTitle>
                            <div className="flex items-center gap-3 mt-2">
                                <span className={cn(
                                    "text-lg font-bold",
                                    isPositive ? "text-emerald-600" : "text-red-600"
                                )}>
                                    {formatCurrency(totalProfit)}
                                </span>
                                <span className="text-sm text-slate-500">
                                    {trades.length} trade{trades.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-slate-100"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-4">
                        {trades.map((trade) => {
                            const isTradePositive = trade.profitLoss >= 0;

                            return (
                                <div
                                    key={trade.id}
                                    className={cn(
                                        "p-4 rounded-2xl border transition-all duration-200",
                                        isTradePositive
                                            ? "bg-emerald-50/50 border-emerald-200"
                                            : "bg-red-50/50 border-red-200"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-xl",
                                                isTradePositive ? "bg-emerald-100" : "bg-red-100"
                                            )}>
                                                {isTradePositive ? (
                                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800">
                                                    {trade.symbol}
                                                </div>
                                                <div className="text-xs text-slate-500 uppercase">
                                                    {trade.side}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "text-lg font-bold",
                                                isTradePositive ? "text-emerald-600" : "text-red-600"
                                            )}>
                                                {formatCurrency(trade.profitLoss)}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 hover:bg-red-100 text-slate-400 hover:text-red-600"
                                                    onClick={() => handleDelete(trade.id)}
                                                    disabled={isDeleting === trade.id}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {trade.note && (
                                        <div className="mt-3 pt-3 border-t border-slate-200/50">
                                            <p className="text-sm text-slate-600">{trade.note}</p>
                                        </div>
                                    )}

                                    {trade.screenshots.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-slate-200/50">
                                            <div className="flex gap-2 overflow-x-auto">
                                                {trade.screenshots.map((ss) => (
                                                    <img
                                                        key={ss.id}
                                                        src={ss.url}
                                                        alt="Trade screenshot"
                                                        className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
