"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TradeScreenshot = {
    id: number;
    tradeId: number;
    url: string;
};

type TradeResponse = {
    success: boolean;
    trade?: {
        id: number;
        uuid: string;
        symbol: string;
        side: string;
        note: string | null;
        screenshots: TradeScreenshot[];
        createdAt: string;
        updatedAt: string;
    };
    error?: string;
    details?: unknown;
};

export function CreateTradeForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TradeResponse | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setResult(null);

        const formData = new FormData(event.currentTarget);

        try {
            const response = await fetch("/api/trades", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Symbol */}
                <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol *</Label>
                    <Input
                        id="symbol"
                        name="symbol"
                        placeholder="e.g., AAPL, TSLA, NIFTY"
                        required
                    />
                </div>

                {/* Side */}
                <div className="space-y-2">
                    <Label htmlFor="side">Side *</Label>
                    <select
                        id="side"
                        name="side"
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                    </select>
                </div>

                {/* Note (Optional) */}
                <div className="space-y-2">
                    <Label htmlFor="note">Note (optional)</Label>
                    <textarea
                        id="note"
                        name="note"
                        rows={3}
                        placeholder="Add notes about this trade..."
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none resize-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    />
                </div>

                {/* Screenshots (Optional) */}
                <div className="space-y-2">
                    <Label htmlFor="screenshots">Screenshots (optional)</Label>
                    <Input
                        id="screenshots"
                        name="screenshots"
                        type="file"
                        accept="image/*"
                        multiple
                    />
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Trade"}
                </Button>
            </form>

            {/* Result Display */}
            {result && (
                <div
                    className={`mt-6 p-4 rounded-md ${result.success
                            ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                        }`}
                >
                    <h3
                        className={`font-semibold ${result.success
                                ? "text-green-800 dark:text-green-200"
                                : "text-red-800 dark:text-red-200"
                            }`}
                    >
                        {result.success ? "✅ Trade Created!" : "❌ Error"}
                    </h3>
                    <pre className="mt-2 text-sm overflow-auto max-h-48">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
