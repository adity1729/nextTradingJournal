import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prismaClient from "db/client";
import { createTradeSchema } from "@/lib/validations/trade";
import { uploadMultipleToS3 } from "@/lib/s3";

/**
 * POST /api/trades
 * Creates a new trade for the authenticated user
 * 
 * Request: multipart/form-data
 * - symbol: string (required)
 * - side: "BUY" | "SELL" (required)
 * - note: string (optional)
 * - screenshots: File[] (optional)
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Check if user is authenticated
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please sign in." },
                { status: 401 }
            );
        }

        // 2. Parse FormData from request
        const formData = await request.formData();

        // Extract text fields
        const symbol = formData.get("symbol") as string;
        const side = formData.get("side") as string;
        const note = formData.get("note") as string | null;

        // Extract screenshot files
        const screenshotFiles = formData.getAll("screenshots") as File[];

        // 3. Validate input with Zod
        const parseResult = createTradeSchema.safeParse({
            symbol,
            side,
            note: note || undefined,
        });

        if (!parseResult.success) {
            // Return validation errors
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: parseResult.error.format()
                },
                { status: 400 }
            );
        }

        const validatedData = parseResult.data;

        // 4. Upload screenshots to S3 (if any)
        let screenshotUrls: string[] = [];

        if (screenshotFiles.length > 0) {
            // Filter out empty files (when no file is selected in form)
            const validFiles = screenshotFiles.filter(
                (file) => file.size > 0
            );

            if (validFiles.length > 0) {
                screenshotUrls = await uploadMultipleToS3(validFiles);
            }
        }

        // 5. Get the user's database ID from their email
        const user = await prismaClient.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        // 6. Create trade in database with related screenshots
        const trade = await prismaClient.trade.create({
            data: {
                userId: user.id,
                symbol: validatedData.symbol,
                side: validatedData.side,
                note: validatedData.note,
                // Create related TradeScreenshot records
                screenshots: {
                    create: screenshotUrls.map((url) => ({ url })),
                },
            },
            // Include screenshots in the response
            include: {
                screenshots: true,
            },
        });

        // 7. Return success response
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
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
