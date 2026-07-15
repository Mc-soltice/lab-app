// lib/auth/auth-options.ts
import { compare, hash } from "bcrypt";
import { randomUUID } from "crypto";
import type { AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "../prisma/client";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    username: string;
    role: "ADMIN" | "BLOGGER";
    avatar?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    googleId?: string | null;
    emailVerified?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      role: "ADMIN" | "BLOGGER";
      avatar?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      googleId?: string | null;
      emailVerified?: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: "ADMIN" | "BLOGGER";
    avatar?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    googleId?: string | null;
    emailVerified?: Date | null;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Email ou mot de passe incorrect");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Email ou mot de passe incorrect");
        }

        // Return user matching NextAuth's User type
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role as "ADMIN" | "BLOGGER",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google" && user) {
        const email = user.email ?? (profile as { email?: string })?.email;
        const googleId = account.providerAccountId ?? null;
        const googleProfile = profile as {
          name?: string;
          given_name?: string;
          family_name?: string;
          picture?: string;
          email_verified?: boolean;
        };
        const emailVerified = googleProfile.email_verified ? new Date() : null;

        if (email) {
          let dbUser = googleId
            ? await prisma.user.findUnique({ where: { googleId } })
            : null;

          if (!dbUser) {
            dbUser = await prisma.user.findUnique({ where: { email } });
          }

          if (!dbUser) {
            const name = user.name ?? googleProfile.name ?? "";
            const [firstName, ...lastParts] = name.split(" ");
            const lastName =
              lastParts.join(" ") || googleProfile.family_name || null;
            const baseUsername =
              user.name?.replace(/\s+/g, "").toLowerCase() ||
              email.split("@")[0];
            let username = baseUsername;
            let suffix = 0;

            while (await prisma.user.findUnique({ where: { username } })) {
              suffix += 1;
              username = `${baseUsername}${suffix}`;
            }

            dbUser = await prisma.user.create({
              data: {
                email,
                googleId,
                emailVerified,
                username,
                password: await hash(randomUUID(), 10),
                firstName: firstName || null,
                lastName,
                avatar: user.image ?? googleProfile.picture ?? null,
                role: "BLOGGER",
              },
            });
          } else if (googleId && !dbUser.googleId) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                googleId,
                emailVerified,
              },
            });
          }

          // Update token with database user data
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.role = dbUser.role as "ADMIN" | "BLOGGER";
          token.avatar = dbUser.avatar;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.googleId = dbUser.googleId;
          token.emailVerified = dbUser.emailVerified;
        }
      }

      // If user is provided (credentials login), populate token
      if (user && !token.id) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role as "ADMIN" | "BLOGGER";
        token.avatar = user.avatar;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.googleId = user.googleId;
        token.emailVerified = user.emailVerified;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.avatar = token.avatar;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.googleId = token.googleId;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
