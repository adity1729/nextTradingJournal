import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prismaClient } from "db/client";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const user = await prismaClient.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    throw new Error("Invalid email or password");
                }

                if (!user.password) {
                    throw new Error(
                        "This account uses Google sign-in. Please use the Google button."
                    );
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: String(user.id),
                    email: user.email,
                    name: user.name,
                    image: user.avatarUrl,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Handle Google OAuth - create or update user
            if (account?.provider === "google") {
                try {
                    const existingUser = await prismaClient.user.findUnique({
                        where: { email: user.email! },
                    });

                    if (!existingUser) {
                        // Create new user for Google OAuth
                        const newUser = await prismaClient.user.create({
                            data: {
                                email: user.email!,
                                name: user.name,
                                avatarUrl: user.image,
                                emailVerified: new Date(),
                            },
                        });

                        // Create account link
                        await prismaClient.account.create({
                            data: {
                                userId: newUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                access_token: account.access_token!,
                                refresh_token: account.refresh_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                session_state: account.session_state as string | undefined,
                            },
                        });
                    } else {
                        // Check if this Google account is already linked
                        const existingAccount = await prismaClient.account.findUnique({
                            where: {
                                provider_providerAccountId: {
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                },
                            },
                        });

                        if (!existingAccount) {
                            // Link Google account to existing user
                            await prismaClient.account.create({
                                data: {
                                    userId: existingUser.id,
                                    type: account.type,
                                    provider: account.provider,
                                    providerAccountId: account.providerAccountId,
                                    access_token: account.access_token!,
                                    refresh_token: account.refresh_token,
                                    expires_at: account.expires_at,
                                    token_type: account.token_type,
                                    scope: account.scope,
                                    id_token: account.id_token,
                                    session_state: account.session_state as string | undefined,
                                },
                            });
                        }

                        // Update user info from Google if not set
                        if (!existingUser.avatarUrl || !existingUser.name) {
                            await prismaClient.user.update({
                                where: { id: existingUser.id },
                                data: {
                                    name: existingUser.name || user.name,
                                    avatarUrl: existingUser.avatarUrl || user.image,
                                    emailVerified: existingUser.emailVerified || new Date(),
                                },
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error handling Google sign in:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
