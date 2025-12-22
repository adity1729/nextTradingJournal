import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismaClient from "@repo/db/client";
import { updateTradeSchema } from "@repo/common/validations";


async function getAuthenticatedUserId(): Promise<number | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const user = await prismaClient.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    return user?.id ?? null;
}

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const tradeId = parseInt(id, 10);

        if (isNaN(tradeId)) {
            return NextResponse.json(
                { success: false, error: "Invalid trade ID" },
                { status: 400 }
            );
        }

        const trade = await prismaClient.trade.findFirst({
            where: { id: tradeId, userId },
            include: {
                screenshots: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
            },
        });

        if (!trade) {
            return NextResponse.json(
                { success: false, error: "Trade not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            trade,
        });
    } catch (error) {
        console.error("Error fetching trade:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}


export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const tradeId = parseInt(id, 10);

        if (isNaN(tradeId)) {
            return NextResponse.json(
                { success: false, error: "Invalid trade ID" },
                { status: 400 }
            );
        }

        // Verify ownership
        const existingTrade = await prismaClient.trade.findFirst({
            where: { id: tradeId, userId },
        });

        if (!existingTrade) {
            return NextResponse.json(
                { success: false, error: "Trade not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const parseResult = updateTradeSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: parseResult.error.format(),
                },
                { status: 400 }
            );
        }

        const updates = parseResult.data;

        const trade = await prismaClient.trade.update({
            where: { id: tradeId },
            data: {
                ...(updates.symbol && { symbol: updates.symbol }),
                ...(updates.side && { side: updates.side }),
                ...(updates.tradeDate && {
                    tradeDate: new Date(updates.tradeDate),
                }),
                ...(updates.profitLoss !== undefined && {
                    profitLoss: updates.profitLoss,
                }),
                ...(updates.note !== undefined && { note: updates.note }),
            },
            include: {
                screenshots: true,
            },
        });

        return NextResponse.json({
            success: true,
            trade,
        });
    } catch (error) {
        console.error("Error updating trade:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}


export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const { id } = await params;
        const tradeId = parseInt(id, 10);

        if (isNaN(tradeId)) {
            return NextResponse.json(
                { success: false, error: "Invalid trade ID" },
                { status: 400 }
            );
        }

        // Verify ownership
        const existingTrade = await prismaClient.trade.findFirst({
            where: { id: tradeId, userId },
        });

        if (!existingTrade) {
            return NextResponse.json(
                { success: false, error: "Trade not found" },
                { status: 404 }
            );
        }

        await prismaClient.trade.delete({
            where: { id: tradeId },
        });

        return NextResponse.json({
            success: true,
            message: "Trade deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting trade:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
