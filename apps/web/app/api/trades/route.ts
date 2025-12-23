import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismaClient from "@repo/db/client";
import { createTradeSchema } from "@repo/common/validations";
import { getPresignedUrl, uploadMultipleToS3 } from "@/lib/s3";
import { Trade, TradeScreenshot } from "@repo/common";
import { getTradesForUser } from "@/lib/services/trades";


async function getAuthenticatedUserId(): Promise<number | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;

    const user = await prismaClient.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
    });

    return user?.id ?? null;
}

export async function GET() {
    console.log("get request triggered for /trades")
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }
        const trades = getTradesForUser(userId)

        return NextResponse.json({
            success: true,
            trades,
        });
    } catch (error) {
        console.error("Error fetching trades:", error);

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

export async function POST(request: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const formData = await request.formData()
        console.log('formData', formData)
        const symbol = formData.get("symbol") as string;
        const side = formData.get("side") as string;
        const profitLoss = formData.get("profitLoss") as string;
        const note = formData.get("note") as string | null;
        const tradeDate = formData.get("tradeDate") as string
        const screenshotFiles = formData.getAll("screenshots") as File[];

        const parseResult = createTradeSchema.safeParse({
            symbol,
            side,
            profitLoss,
            note: note || undefined,
            tradeDate
        });

        console.log('pareseResult', parseResult)

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

        const validatedData = parseResult.data;

        // // Upload screenshots to S3 (if any)
        let screenshotUrls: string[] = [];

        if (screenshotFiles.length > 0) {
            const validFiles = screenshotFiles.filter((file) => file.size > 0);

            if (validFiles.length > 0) {
                screenshotUrls = await uploadMultipleToS3(validFiles);
            }
        }

        const trade = await prismaClient.trade.create({
            data: {
                userId,
                symbol: validatedData.symbol,
                side: validatedData.side,
                note: validatedData.note,
                profitLoss: validatedData.profitLoss,
                tradeDate: new Date(validatedData.tradeDate),
                screenshots: {
                    create: screenshotUrls.map((key) => ({ key })),
                },
            },
            include: {
                screenshots: true,
            },
        });
        console.log('trade', trade)
        return NextResponse.json(
            {
                success: true,
                trade: trade,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating trade:", error);

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
