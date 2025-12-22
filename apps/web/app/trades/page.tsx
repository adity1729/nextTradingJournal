import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prismaClient from "@repo/db/client";
import TradeCalendar from "@/components/trades/TradeCalendar";

export default async function TradesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/signin");
    }

    // Get user from database
    const user = await prismaClient.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        redirect("/signin");
    }

    // Fetch all trades for this user with screenshots
    const trades = await prismaClient.trade.findMany({
        where: { userId: user.id },
        include: {
            screenshots: {
                select: {
                    id: true,
                    url: true
                }
            }
        },
        orderBy: { tradeDate: 'desc' }
    });

    return <TradeCalendar trades={trades} />;
}