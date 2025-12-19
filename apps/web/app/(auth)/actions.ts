"use server";

import { prismaClient } from "db/client";
import bcrypt from "bcryptjs";

// Types for action responses
export type ActionResponse = {
    success: boolean;
    message: string;
    error?: string;
};

// Sign Up Action
export async function signUpAction(formData: FormData): Promise<ActionResponse> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        return {
            success: false,
            message: "All fields are required",
            error: "MISSING_FIELDS",
        };
    }

    if (password !== confirmPassword) {
        return {
            success: false,
            message: "Passwords do not match",
            error: "PASSWORD_MISMATCH",
        };
    }

    if (password.length < 8) {
        return {
            success: false,
            message: "Password must be at least 8 characters",
            error: "PASSWORD_TOO_SHORT",
        };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: "Please enter a valid email address",
            error: "INVALID_EMAIL",
        };
    }

    try {
        // Check if user already exists
        const existingUser = await prismaClient.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return {
                success: false,
                message: "An account with this email already exists",
                error: "USER_EXISTS",
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        await prismaClient.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return {
            success: true,
            message: "Account created successfully! Please sign in.",
        };
    } catch (error) {
        console.error("Sign up error:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again.",
            error: "INTERNAL_ERROR",
        };
    }
}

// Sign In Action (for credentials - validates user before NextAuth handles session)
export async function validateCredentials(
    email: string,
    password: string
): Promise<ActionResponse & { userId?: number }> {
    if (!email || !password) {
        return {
            success: false,
            message: "Email and password are required",
            error: "MISSING_FIELDS",
        };
    }

    try {
        const user = await prismaClient.user.findUnique({
            where: { email },
        });

        if (!user) {
            return {
                success: false,
                message: "Invalid email or password",
                error: "INVALID_CREDENTIALS",
            };
        }

        if (!user.password) {
            return {
                success: false,
                message: "This account uses Google sign-in. Please use the Google button to sign in.",
                error: "OAUTH_ACCOUNT",
            };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return {
                success: false,
                message: "Invalid email or password",
                error: "INVALID_CREDENTIALS",
            };
        }

        return {
            success: true,
            message: "Credentials validated",
            userId: user.id,
        };
    } catch (error) {
        console.error("Sign in validation error:", error);
        return {
            success: false,
            message: "Something went wrong. Please try again.",
            error: "INTERNAL_ERROR",
        };
    }
}
