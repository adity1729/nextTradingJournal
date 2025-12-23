import prismaClient from "@repo/db/client";
import { getPresignedUrl } from "@/lib/s3";
import { Trade } from "@repo/common";

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