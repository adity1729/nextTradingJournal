import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import TradeCalendar from "@/components/trades/TradeCalendar";

export default async function TradesPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/signin");
    }

    // Pure CSR - just render the calendar, it will fetch its own data
    return <TradeCalendar />;
}