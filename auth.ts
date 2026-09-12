// ---------------------------------------------------------------------------
// Kimlik dogrulama (Bolum 3 + Bolum 6): "/admin icin basit sifreli giris
// (NextAuth credentials provider veya benzeri basit bir cozum yeterli - OAuth
// gerekmez)". JWT oturum stratejisi kullanilir, ayri bir sessions tablosu
// gerekmez. Route korumasi (kim nereye girebilir) proxy.ts icinde acikca
// yapilir - bu dosya sadece NextAuth'un kendisini yapilandirir.
//
// /panel icin ayri, cok daha basit bir koruma modeli var (paylasilan tek
// sifre, kisisel hesap degil) - bkz. lib/panel-session.ts + proxy.ts.
// ---------------------------------------------------------------------------
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Sifre", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, email.toLowerCase().trim()))
          .limit(1);
        if (!user) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.fullName ?? user.email,
          role: user.role,
          departmentId: user.departmentId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.departmentId = user.departmentId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.departmentId = token.departmentId;
      return session;
    },
  },
});
