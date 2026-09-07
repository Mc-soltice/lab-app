// lib/auth/auth-options.ts
import { compare, hash } from "bcrypt";
import { randomUUID } from "crypto";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "../prisma/client";

// IMPORTANT: Remove the declare module blocks from here
// They should only exist in types/next-auth.d.ts

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

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role as "ADMIN" | "BLOGGER" | "GESTIONNAIRE",
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

          token.id = dbUser.id;
          token.username = dbUser.username;
          token.role = dbUser.role as "ADMIN" | "BLOGGER" | "GESTIONNAIRE";
          token.avatar = dbUser.avatar;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.googleId = dbUser.googleId;
          token.emailVerified = dbUser.emailVerified;
        }
      }

      if (user && !token.id) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role as "ADMIN" | "BLOGGER" | "GESTIONNAIRE";
        token.avatar = user.avatar;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.googleId = user.googleId;
        token.emailVerified = user.emailVerified;
      }

      // Handle legacy roles if needed (remove this check or update it)
      // If you have users with "USER" role in your database, you need to handle this
      // Option 1: Keep the check but cast to any
      if ((token.role as any) === "USER") {
        token.role = "BLOGGER";
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
        session.user.email = token.email || session.user.email;
        session.user.name = token.name || session.user.name;
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
