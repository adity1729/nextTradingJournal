"use server";

import prismaClient from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { TradeSide } from "@repo/common/types"

async function getAuthenticatedUserId(): Promise<number | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const user = await prismaClient.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    return user?.id ?? null;
}

export interface AddTradeInput {
    symbol: string;
    side: TradeSide;
    tradeDate: string; // ISO date string
    profitLoss: number;
    note?: string;
}

export async function addTrade(input: AddTradeInput) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const trade = await prismaClient.trade.create({
            data: {
                userId,
                symbol: input.symbol,
                side: input.side,
                tradeDate: new Date(input.tradeDate),
                profitLoss: input.profitLoss,
                note: input.note,
            },
            include: { screenshots: true }
        });

        revalidatePath("/trades");
        return { success: true, trade };
    } catch (error) {
        console.error("Error adding trade:", error);
        return { success: false, error: "Failed to add trade" };
    }
}

export async function updateTrade(
    tradeId: number,
    updates: Partial<Omit<AddTradeInput, 'tradeDate'> & { tradeDate?: string }>
) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Verify ownership
        const existingTrade = await prismaClient.trade.findFirst({
            where: { id: tradeId, userId }
        });

        if (!existingTrade) {
            return { success: false, error: "Trade not found" };
        }

        const trade = await prismaClient.trade.update({
            where: { id: tradeId },
            data: {
                ...(updates.symbol && { symbol: updates.symbol }),
                ...(updates.side && { side: updates.side }),
                ...(updates.tradeDate && { tradeDate: new Date(updates.tradeDate) }),
                ...(updates.profitLoss !== undefined && { profitLoss: updates.profitLoss }),
                ...(updates.note !== undefined && { note: updates.note }),
            },
            include: { screenshots: true }
        });

        revalidatePath("/trades");
        return { success: true, trade };
    } catch (error) {
        console.error("Error updating trade:", error);
        return { success: false, error: "Failed to update trade" };
    }
}

export async function deleteTrade(tradeId: number) {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Verify ownership
        const existingTrade = await prismaClient.trade.findFirst({
            where: { id: tradeId, userId }
        });

        if (!existingTrade) {
            return { success: false, error: "Trade not found" };
        }

        await prismaClient.trade.delete({
            where: { id: tradeId }
        });

        revalidatePath("/trades");
        return { success: true };
    } catch (error) {
        console.error("Error deleting trade:", error);
        return { success: false, error: "Failed to delete trade" };
    }
}
