import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateTradeForm } from "@/components/trades/CreateTradeForm";

export default async function TestTradePage() {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/signin");
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        Create Trade
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                        Logged in as: {session.user?.email}
                    </p>
                </div>

                {/* Card Container */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-200 dark:border-zinc-800">
                    <CreateTradeForm />
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
