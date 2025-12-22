import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismaClient from "@repo/db/client";
import { createTradeSchema, addTradeSchema } from "@repo/common/validations";
import { uploadMultipleToS3 } from "@/lib/s3";


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
    try {
        const userId = await getAuthenticatedUserId();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        const trades = await prismaClient.trade.findMany({
            where: { userId },
            include: {
                screenshots: {
                    select: {
                        id: true,
                        url: true,
                    },
                },
            },
            orderBy: { tradeDate: "desc" },
        });

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

        const contentType = request.headers.get("content-type") || "";

        // Handle JSON body (calendar add-trade flow)
        if (contentType.includes("application/json")) {
            const body = await request.json();

            const parseResult = addTradeSchema.safeParse(body);

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

            const trade = await prismaClient.trade.create({
                data: {
                    userId,
                    symbol: validatedData.symbol,
                    side: validatedData.side,
                    tradeDate: new Date(validatedData.tradeDate),
                    profitLoss: validatedData.profitLoss,
                    note: validatedData.note,
                },
                include: {
                    screenshots: true,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    trade,
                },
                { status: 201 }
            );
        }

        // Handle FormData (with screenshots)
        const formData = await request.formData();

        const symbol = formData.get("symbol") as string;
        const side = formData.get("side") as string;
        const note = formData.get("note") as string | null;
        const screenshotFiles = formData.getAll("screenshots") as File[];

        const parseResult = createTradeSchema.safeParse({
            symbol,
            side,
            note: note || undefined,
        });

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

        // Upload screenshots to S3 (if any)
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
                screenshots: {
                    create: screenshotUrls.map((url) => ({ url })),
                },
            },
            include: {
                screenshots: true,
            },
        });

        return NextResponse.json(
            {
                success: true,
                trade,
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
