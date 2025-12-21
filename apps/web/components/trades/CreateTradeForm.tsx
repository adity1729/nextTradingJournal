"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import type { Trade, TradeScreenshot, ApiResponse } from "@repo/common/types";

// Response type for create trade API
type TradeResponse = ApiResponse<Trade>;

export function CreateTradeForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<TradeResponse | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setResult(null);

        const formData = new FormData(event.currentTarget);

        try {
            const response = await axios.post(
                "/api/trades",
                formData
            )
            const data = response.data
            setResult(data);

            // Reset file selection on success
            if (data.success) {
                setSelectedFiles(null);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setResult({
                    success: false,
                    error: error.response?.data?.error || "Request failed"
                })
            }
        } finally {
            setIsLoading(false);
        }
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSelectedFiles(event.target.files);
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

                {/* Screenshots (Optional) - Using native input for better multiple file support */}
                <div className="space-y-2">
                    <Label htmlFor="screenshots">Screenshots (optional)</Label>
                    <input
                        id="screenshots"
                        name="screenshots"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-300"
                    />
                    {selectedFiles && selectedFiles.length > 0 && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
                        </p>
                    )}
                    <p className="text-xs text-zinc-400">
                        💡 Hold Cmd (Mac) or Ctrl (Windows) to select multiple files
                    </p>
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

