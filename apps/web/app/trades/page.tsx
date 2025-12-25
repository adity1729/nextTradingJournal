import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prismaClient from "@repo/db/client";
import TradeCalendar from "@/components/trades/TradeCalendar";
import { getTradesForMonth } from "@/lib/services/trades";
export default async function TradesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect("/signin");
    }
    const user = await prismaClient.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });
    if (!user) {
        redirect("/signin");
    }
    // Get current month (1-12)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Convert to 1-indexed
    // Fetch only current month's trades for SSR
    const { trades } = await getTradesForMonth(user.id, currentYear, currentMonth);
    return (
        <TradeCalendar
            initialTrades={trades}
            initialYear={currentYear}
            initialMonth={currentMonth}
        />
    );
}