// Placeholder for Update/Delete Trade endpoints
// TODO: Implement GET, PUT, DELETE handlers

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const session = getServerSession(authOptions)

    return new Response("Not implemented yet", { status: 501 });
}
