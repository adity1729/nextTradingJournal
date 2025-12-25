"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TradeDetailModal from "@/components/trades/TradeDetailModal";
import AddTradeModal from "@/components/trades/AddTradeModal";
import type { TradeWithScreenshots, WeekTotal } from "@repo/common/types";
import {
    getTradesByDate,
    getDayProfit,
    getDayStats,
    formatCurrency,
    getDaysInMonth,
    getFirstDayOfMonth,
} from "@/lib/trade-utils";
import { useTrades } from "@/hooks/use-trades";

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Skeleton shimmer animation
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <div
            className={cn(
                "animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]",
                className
            )}
            style={style}
        />
    );
}

// Calendar Day Skeleton
function DaySkeleton({ hasContent = false }: { hasContent?: boolean }) {
    return (
        <div className="aspect-square border rounded-2xl p-3 bg-white/50 border-slate-200/50">
            <div className="h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                    <Shimmer className="w-6 h-4 rounded" />
                    <Shimmer className="w-5 h-5 rounded-lg" />
                </div>
                {hasContent && (
                    <div className="space-y-1.5">
                        <Shimmer className="w-16 h-3 rounded" />
                        <Shimmer className="w-12 h-2 rounded" />
                        <Shimmer className="w-14 h-2 rounded" />
                    </div>
                )}
            </div>
        </div>
    );
}

// Weekly Card Skeleton
function WeekCardSkeleton() {
    return (
        <Card className="bg-white/70 backdrop-blur-xl shadow-sm border-0">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Shimmer className="w-2 h-2 rounded-full" />
                        <Shimmer className="w-16 h-4 rounded" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Shimmer className="w-20 h-6 rounded" />
                    <div className="flex items-center justify-between">
                        <Shimmer className="w-12 h-3 rounded" />
                        <Shimmer className="w-14 h-4 rounded-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Full Calendar Skeleton
function CalendarSkeleton({ daysInMonth, firstDayOfMonth }: { daysInMonth: number; firstDayOfMonth: number }) {
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Randomly decide which days have "content" for visual variety
    const contentDays = new Set([3, 7, 12, 15, 18, 22, 25, 28]);

    return (
        <>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 mb-6">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-4 text-center text-sm font-semibold text-slate-500 uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid Skeleton */}
            <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                ))}
                {days.map((day) => (
                    <DaySkeleton key={day} hasContent={contentDays.has(day)} />
                ))}
            </div>
        </>
    );
}

// Performance Stats Skeleton
function StatsSkeleton() {
    return (
        <div className="text-right bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <div className="text-sm text-slate-500 font-medium mb-1">Monthly Performance</div>
            <div className="flex items-center gap-4">
                <div className="text-center">
                    <Shimmer className="w-20 h-7 rounded mx-auto mb-1" />
                    <div className="text-xs text-slate-500 font-medium">P&L</div>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                    <Shimmer className="w-12 h-7 rounded mx-auto mb-1" />
                    <div className="text-xs text-slate-500 font-medium">Win Rate</div>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                    <Shimmer className="w-8 h-6 rounded mx-auto mb-1" />
                    <div className="text-xs text-slate-500 font-medium">Days</div>
                </div>
            </div>
        </div>
    );
}

// Premium Bar Chart Component
function WeeklyBarChart({ weeks }: { weeks: WeekTotal[] }) {
    const maxAbsValue = Math.max(...weeks.map(week => Math.abs(week.total)));
    const chartHeight = 80;

    return (
        <div className="flex items-end justify-between gap-1 h-20 px-1">
            {weeks.map((week, index) => {
                const barHeight = maxAbsValue > 0 ? (Math.abs(week.total) / maxAbsValue) * chartHeight : 0;
                const isPositive = week.total >= 0;

                return (
                    <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                        <div className="flex-1 flex items-end justify-center w-full">
                            <div
                                className={cn(
                                    "w-full max-w-[14px] rounded-[3px] transition-all duration-700 ease-out",
                                    isPositive
                                        ? "bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-sm"
                                        : "bg-gradient-to-t from-red-500 to-red-400 shadow-sm",
                                    barHeight < 4 && week.total !== 0 && "min-h-[4px]"
                                )}
                                style={{ height: `${Math.max(barHeight, week.total !== 0 ? 4 : 0)}px` }}
                            />
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 mt-1.5">
                            W{week.weekNumber}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Premium Week Card Component
function WeekCard({ week, isLastWeek }: { week: WeekTotal; isLastWeek: boolean }) {
    const isPositive = week.total >= 0;
    const hasActivity = week.tradingDays > 0;

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-300 border-0",
            "bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-lg",
            "hover:bg-white/80 hover:-translate-y-0.5",
            isLastWeek && "ring-1 ring-blue-200 bg-blue-50/70"
        )}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full transition-colors duration-300",
                            hasActivity
                                ? isPositive
                                    ? "bg-emerald-400 shadow-sm shadow-emerald-200"
                                    : "bg-red-400 shadow-sm shadow-red-200"
                                : "bg-slate-200"
                        )} />
                        <span className="text-sm font-semibold text-slate-600">
                            Week {week.weekNumber}
                        </span>
                    </div>

                    {hasActivity && (
                        <div className={cn(
                            "p-1 rounded-full transition-colors duration-300",
                            isPositive ? "bg-emerald-50" : "bg-red-50"
                        )}>
                            {isPositive ? (
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                            ) : (
                                <TrendingDown className="w-3 h-3 text-red-600" />
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className={cn(
                        "text-xl font-bold transition-colors duration-300",
                        hasActivity
                            ? isPositive
                                ? "text-emerald-700"
                                : "text-red-700"
                            : "text-slate-400"
                    )}>
                        {hasActivity ? formatCurrency(week.total) : "$0"}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500 font-medium">
                            {week.tradingDays} day{week.tradingDays !== 1 ? 's' : ''}
                        </div>

                        {hasActivity && (
                            <div className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
                                isPositive
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                            )}>
                                {isPositive ? 'Profit' : 'Loss'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Subtle gradient overlay */}
                <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                    "bg-gradient-to-br from-white/50 to-transparent"
                )} />
            </CardContent>
        </Card>
    );
}

interface TradeCalendarProps {
    initialTrades: TradeWithScreenshots[];
    initialYear: number;
    initialMonth: number; // 1-12 (1-indexed)
}

export default function TradeCalendar({
    initialTrades,
    initialYear,
    initialMonth
}: TradeCalendarProps) {
    // Track current displayed month (1-12, 1-indexed)
    const [displayYear, setDisplayYear] = useState(initialYear);
    const [displayMonth, setDisplayMonth] = useState(initialMonth);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [addTradeDate, setAddTradeDate] = useState<string | null>(null);

    // Use React Query with SSR hydration
    const { trades, isFetching } = useTrades(displayYear, displayMonth, {
        initialData: {
            trades: initialTrades,
            year: initialYear,
            month: initialMonth,
            hasMore: true,
        },
    });

    // For calendar rendering, use 0-indexed month
    const year = displayYear;
    const month = displayMonth - 1; // Convert to 0-indexed for JS Date functions

    // Get today's date for comparison
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    // Navigation with prefetching (handled automatically in useTrades hook)
    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (displayMonth === 1) {
                setDisplayYear(displayYear - 1);
                setDisplayMonth(12);
            } else {
                setDisplayMonth(displayMonth - 1);
            }
        } else {
            if (displayMonth === 12) {
                setDisplayYear(displayYear + 1);
                setDisplayMonth(1);
            } else {
                setDisplayMonth(displayMonth + 1);
            }
        }
    };

    // Show loading overlay when navigating to a different month than initial
    const showLoadingOverlay = isFetching && (
        displayYear !== initialYear || displayMonth !== initialMonth
    );

    const isFutureDate = (dateStr: string) => dateStr > todayStr;

    // Calculate weekly totals
    const getWeeklyTotals = (): WeekTotal[] => {
        const weeks: (number | null)[][] = [];
        let currentWeek: (number | null)[] = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            currentWeek.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeks.push([...currentWeek]);
                currentWeek = [];
            }
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        return weeks.map((week, index) => {
            const weekTotal = week
                .filter((day): day is number => day !== null)
                .reduce((sum, day) => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    return sum + getDayProfit(trades, dateStr);
                }, 0);

            const tradingDays = week
                .filter((day): day is number => day !== null)
                .filter(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    return getTradesByDate(trades, dateStr).length > 0;
                }).length;

            return {
                weekNumber: index + 1,
                total: weekTotal,
                tradingDays
            };
        });
    };

    const weeklyTotals = getWeeklyTotals();
    const monthlyTotal = weeklyTotals.reduce((sum, week) => sum + week.total, 0);
    const monthlyTradingDays = weeklyTotals.reduce((sum, week) => sum + week.tradingDays, 0);

    // Monthly stats
    const monthlyTrades = trades.filter(trade => {
        const tradeDate = new Date(trade.tradeDate);
        return tradeDate.getMonth() === month && tradeDate.getFullYear() === year;
    });
    const monthlyWinningTrades = monthlyTrades.filter(trade => trade.profitLoss > 0).length;
    const monthlyWinRate = monthlyTrades.length > 0 ? (monthlyWinningTrades / monthlyTrades.length) * 100 : 0;

    // Current week indicator
    const currentWeek = Math.ceil((today.getDate() + firstDayOfMonth) / 7);
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateMonth('prev')}
                            className="hover:bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </Button>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                {MONTH_NAMES[month]} {year}
                            </h1>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateMonth('next')}
                            className="hover:bg-white/60 backdrop-blur-sm border border-white/20 rounded-xl"
                        >
                            <ChevronRight className="w-5 h-5 text-slate-600" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <div className="text-sm text-slate-500 font-medium mb-1">Monthly Performance</div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className={cn(
                                        "text-2xl font-bold",
                                        monthlyTotal >= 0 ? "text-emerald-700" : "text-red-700"
                                    )}>
                                        {formatCurrency(monthlyTotal)}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">P&L</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200"></div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-700">
                                        {monthlyWinRate.toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">Win Rate</div>
                                </div>
                                <div className="w-px h-12 bg-slate-200"></div>
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-slate-600">
                                        {monthlyTradingDays}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">Days</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Calendar */}
                    <div className="lg:col-span-3">
                        <Card className="relative shadow-xl bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
                            <CardContent className="p-8">
                                {showLoadingOverlay ? (
                                    <CalendarSkeleton
                                        daysInMonth={daysInMonth}
                                        firstDayOfMonth={firstDayOfMonth}
                                    />
                                ) : (
                                    <>
                                        {/* Calendar Header */}
                                        <div className="grid grid-cols-7 mb-6">
                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                <div key={day} className="p-4 text-center text-sm font-semibold text-slate-500 uppercase tracking-wide">
                                                    {day}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Calendar Grid */}
                                        <div className="grid grid-cols-7 gap-2">
                                            {emptyDays.map((_, index) => (
                                                <div key={`empty-${index}`} className="aspect-square" />
                                            ))}

                                            {days.map((day) => {
                                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                const dayTrades = getTradesByDate(trades, dateStr);
                                                const dayStats = getDayStats(trades, dateStr);
                                                const hasTrades = dayTrades.length > 0;
                                                const isProfit = dayStats.totalProfit > 0;
                                                const isLoss = dayStats.totalProfit < 0;
                                                const isFuture = isFutureDate(dateStr);
                                                const isToday = dateStr === todayStr;

                                                return (
                                                    <div
                                                        key={day}
                                                        className={cn(
                                                            "aspect-square border rounded-2xl p-3 relative transition-all duration-300 hover:scale-105",
                                                            isFuture && "bg-slate-100/50 border-slate-200/50 text-slate-400 cursor-not-allowed opacity-50",
                                                            isToday && !isFuture && "border-blue-400 bg-blue-50/70 shadow-lg shadow-blue-200/50",
                                                            hasTrades && isProfit && !isFuture && "bg-emerald-50/70 border-emerald-200 shadow-lg shadow-emerald-200/50",
                                                            hasTrades && isLoss && !isFuture && "bg-red-50/70 border-red-200 shadow-lg shadow-red-200/50",
                                                            !isFuture && !hasTrades && "hover:bg-white/80 cursor-pointer hover:shadow-lg hover:border-slate-300",
                                                            !isFuture && hasTrades && "cursor-pointer hover:shadow-xl",
                                                            !isFuture && !hasTrades && !isToday && "bg-white/50 border-slate-200/50"
                                                        )}
                                                        onClick={() => hasTrades && !isFuture && setSelectedDate(dateStr)}
                                                    >
                                                        <div className="h-full flex flex-col justify-between">
                                                            <div className="flex items-center justify-between">
                                                                <span className={cn(
                                                                    "text-sm font-bold",
                                                                    isToday && !isFuture && "text-blue-700",
                                                                    isFuture && "text-slate-400",
                                                                    !isToday && !isFuture && "text-slate-700"
                                                                )}>
                                                                    {day}
                                                                </span>
                                                                {!isFuture && (
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="w-5 h-5 hover:bg-blue-100 rounded-lg transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setAddTradeDate(dateStr);
                                                                        }}
                                                                    >
                                                                        <Plus className="w-3 h-3 text-slate-600" />
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            {hasTrades && !isFuture && (
                                                                <div className="space-y-1">
                                                                    <div className={cn(
                                                                        "text-xs font-bold",
                                                                        isProfit ? "text-emerald-700" : "text-red-700"
                                                                    )}>
                                                                        {formatCurrency(dayStats.totalProfit)}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[10px]">
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="text-emerald-600 font-semibold">{dayStats.profitableTrades}W</span>
                                                                            <span className="text-red-600 font-semibold">{dayStats.lossTrades}L</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-500 font-medium">
                                                                        {dayStats.totalTrades} trade{dayStats.totalTrades !== 1 ? 's' : ''}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {isToday && !isFuture && (
                                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Weekly Summary Sidebar */}
                    <div className="space-y-6">
                        {showLoadingOverlay ? (
                            <>
                                <Card className="shadow-xl bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
                                    <CardHeader className="pb-8">
                                        <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                            Weekly Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex items-end justify-between gap-1 h-20 px-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="flex flex-col items-center flex-1 min-w-0">
                                                    <Shimmer className="w-3 rounded-[3px]" style={{ height: `${20 + Math.random() * 40}px` }} />
                                                    <Shimmer className="w-6 h-3 rounded mt-1.5" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-200/50">
                                            <Shimmer className="w-32 h-3 rounded mx-auto" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <WeekCardSkeleton key={i} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <Card className="shadow-xl bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden">
                                    <CardHeader className="pb-8">
                                        <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                            Weekly Overview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <WeeklyBarChart weeks={weeklyTotals} />
                                        <div className="mt-4 pt-4 border-t border-slate-200/50">
                                            <div className="text-xs text-slate-500 text-center font-medium">
                                                {MONTH_NAMES[month]} Performance Trend
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    {weeklyTotals.map((week) => (
                                        <WeekCard
                                            key={week.weekNumber}
                                            week={week}
                                            isLastWeek={isCurrentMonth && week.weekNumber === currentWeek}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Modals */}
                {selectedDate && (
                    <TradeDetailModal
                        isOpen={!!selectedDate}
                        onClose={() => setSelectedDate(null)}
                        date={selectedDate}
                        trades={getTradesByDate(trades, selectedDate)}
                    />
                )}

                {addTradeDate && (
                    <AddTradeModal
                        isOpen={!!addTradeDate}
                        onClose={() => setAddTradeDate(null)}
                        date={addTradeDate}
                    />
                )}
            </div>
        </div>
    );
}
