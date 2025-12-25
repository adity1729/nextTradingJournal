import prismaClient from "@repo/db/client";
import { getPresignedUrl } from "@/lib/s3";
import { PaginatedTradesResponse, Trade } from "@repo/common";

export async function getTradesForUser(userId: number) {
    const trades = await prismaClient.trade.findMany({
        where: { userId },
        include: {
            screenshots: { select: { id: true, key: true } },
        },
        orderBy: { tradeDate: "desc" },
    });

    // Transform keys to presigned URLs
    return Promise.all(
        trades.map(async (trade: Trade) => ({
            ...trade,
            screenshots: await Promise.all(
                (trade.screenshots ?? []).map(async (s) => ({
                    ...s,
                    url: await getPresignedUrl(s.key),
                }))
            ),
        }))
    );
}

async function transformTradeWithUrls(trade: Trade) {
    return {
        ...trade,
        screenshots: await Promise.all(
            (trade.screenshots ?? []).map(async (s) => ({
                ...s,
                url: await getPresignedUrl(s.key),
            }))
        )
    }
}

export async function getTradesForMonth(
    userId: number,
    year: number,
    month: number
): Promise<PaginatedTradesResponse> {

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 1)
    const trades = await prismaClient.trade.findMany({
        where: {
            userId,
            tradeDate: {
                gte: startDate,
                lt: endDate
            }
        },
        include: {
            screenshots: {
                select: {
                    id: true,
                    key: true
                }
            }
        }
    })
    const hasMore = await prismaClient.trade.count({
        where: {
            userId,
            tradeDate: {
                lt: startDate
            }
        }
    }) > 0;
    const transformedTrades = await Promise.all(
        trades.map((trade: Trade) => transformTradeWithUrls(trade))
    )

    return {
        trades: transformedTrades,
        year,
        month,
        hasMore
    }
}