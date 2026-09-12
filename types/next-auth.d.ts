// NextAuth (Auth.js) v5 icin Session/JWT tip genislemesi.
// admin_users.role alanini session.user ve token uzerinde tip-guvenli hale getirir.

import type { DefaultSession } from "next-auth";

export type AdminRole = "ik_admin" | "genel_mudur" | "departman_muduru";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AdminRole;
      // Bolum 5 Faz1.5 madde 21: role="departman_muduru" icin - sadece kendi
      // departmanini gorebilmesi icin gerekli. Diger roller icin null.
      departmentId: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: AdminRole;
    departmentId: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
    departmentId: number | null;
  }
}

// next-auth/jwt sadece "@auth/core/jwt"yi yeniden export ediyor (export * from);
// NextAuth'un ic callback imzalari JWT tipini dogrudan @auth/core/jwt'den okuyor,
// bu yuzden ayni genislemeyi burada da tekrarlamak gerekiyor - aksi halde
// token.id / token.role callback icinde "unknown" olarak kalir.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
    departmentId: number | null;
  }
}
