import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prismaClient from "@repo/db/client";
import TradeCalendar from "@/components/trades/TradeCalendar";
import { getTradesForUser } from "@/lib/services/trades";

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
    const trades = await getTradesForUser(user.id);
    return <TradeCalendar trades={trades} />;
}