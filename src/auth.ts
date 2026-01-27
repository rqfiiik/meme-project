import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const providers: any[] = [
    Credentials({
        name: "Credentials",
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
            // Hardcoded Admin Check as Requested
            const adminEmail = "rqfik.lakehal@gmail.com";
            const adminPass = "RA07092004fik*";

            if (credentials?.email === adminEmail && credentials?.password === adminPass) {
                // Check if Admin exists in DB (to link data), if not create/return minimal
                try {
                    // Check DB for admin
                    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
                    if (user) return user;

                    // Link Admin to DB if not exists (Essential for Foreign Key relations like Blog Posts)
                    const newAdmin = await prisma.user.create({
                        data: {
                            id: "cmkkd95ig0000hfccb1blua6m",
                            name: "Admin",
                            email: "rqfik.lakehal@gmail.com",
                            role: "admin",
                            image: "https://github.com/shadcn.png"
                        }
                    });

                    // Return clean object to avoid Date object serialization issues in NextAuth
                    return {
                        id: newAdmin.id,
                        name: newAdmin.name,
                        email: newAdmin.email,
                        image: newAdmin.image,
                        role: newAdmin.role
                    };
                } catch (e) {
                    return null;
                }
            }

            return null;
        },
    }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_ID !== 'placeholder' && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_GOOGLE_SECRET !== 'placeholder') {
    providers.push(Google({
        profile(profile) {
            return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                firstName: profile.given_name,
                lastName: profile.family_name,
                username: profile.email?.split('@')[0], // Default username
                role: "user",
            }
        }
    }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    providers,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.sub as string;
            }
            return session;
        }
    },
    events: {
        async createUser({ user }) {
            try {
                const { cookies } = await import("next/headers");
                const cookieStore = await cookies();
                const refCode = cookieStore.get("affiliate_ref")?.value;

                if (refCode && user.id) {
                    // Find referrer - Cast to any to bypass missing strict types from manual SQL update
                    const referrer = await (prisma.user as any).findUnique({
                        where: { promoCode: refCode }
                    });

                    // Update user if referrer exists, is a creator, and is not self
                    if (referrer && referrer.isCreator && referrer.id !== user.id) {
                        await (prisma.user as any).update({
                            where: { id: user.id },
                            data: { referrerId: referrer.id }
                        });
                        console.log(`[Affiliate] Linked user ${user.id} to referrer ${referrer.id} (${refCode})`);
                    }
                }
            } catch (error) {
                console.error("[Affiliate] Error linking referrer:", error);
            }
        }
    },
})
