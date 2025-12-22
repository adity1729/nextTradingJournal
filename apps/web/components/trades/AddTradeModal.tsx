"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addTradeApi } from "@/lib/api/trades";
import type { AddTradeInput } from "@repo/common/types";

interface AddTradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
}

export default function AddTradeModal({ isOpen, onClose, date }: AddTradeModalProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        symbol: "",
        side: "BUY" as "BUY" | "SELL",
        profitLoss: "",
        note: ""
    });

    if (!isOpen) return null;

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const input: AddTradeInput = {
                symbol: formData.symbol.toUpperCase(),
                side: formData.side,
                tradeDate: date,
                profitLoss: parseFloat(formData.profitLoss) || 0,
                note: formData.note || undefined
            };

            const result = await addTradeApi(input);

            if (result.success) {
                // Reset form and close
                setFormData({ symbol: "", side: "BUY", profitLoss: "", note: "" });
                onClose();
                // Refresh to get updated data
                router.refresh();
            } else {
                console.error("Failed to add trade:", result.error);
            }
        } catch (error) {
            console.error("Error submitting trade:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border-0 rounded-3xl mx-4">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">
                                Add Trade
                            </CardTitle>
                            <p className="text-sm text-slate-500 mt-1">
                                {formattedDate}
                            </p>
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

                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Symbol */}
                        <div className="space-y-2">
                            <Label htmlFor="symbol">Symbol</Label>
                            <Input
                                id="symbol"
                                placeholder="e.g., AAPL, TSLA, SPY"
                                value={formData.symbol}
                                onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                                className="rounded-xl"
                                required
                            />
                        </div>

                        {/* Side */}
                        <div className="space-y-2">
                            <Label>Side</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={formData.side === "BUY" ? "default" : "outline"}
                                    className={`flex-1 rounded-xl ${formData.side === "BUY" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                                    onClick={() => setFormData(prev => ({ ...prev, side: "BUY" }))}
                                >
                                    Long / Buy
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.side === "SELL" ? "default" : "outline"}
                                    className={`flex-1 rounded-xl ${formData.side === "SELL" ? "bg-red-600 hover:bg-red-700" : ""}`}
                                    onClick={() => setFormData(prev => ({ ...prev, side: "SELL" }))}
                                >
                                    Short / Sell
                                </Button>
                            </div>
                        </div>

                        {/* Profit/Loss */}
                        <div className="space-y-2">
                            <Label htmlFor="profitLoss">Profit / Loss ($)</Label>
                            <Input
                                id="profitLoss"
                                type="number"
                                step="0.01"
                                placeholder="e.g., 150.50 or -75.25"
                                value={formData.profitLoss}
                                onChange={(e) => setFormData(prev => ({ ...prev, profitLoss: e.target.value }))}
                                className="rounded-xl"
                                required
                            />
                            <p className="text-xs text-slate-500">
                                Use negative for losses (e.g., -100)
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="note">Notes (optional)</Label>
                            <textarea
                                id="note"
                                placeholder="Trade notes, strategy, lessons learned..."
                                value={formData.note}
                                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                className="w-full min-h-[80px] px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Trade"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
