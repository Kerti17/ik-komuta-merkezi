// Sifre hash'leme yardimcilari - bcryptjs (saf JS, native binary derdi yok - bkz.
// step 1'de yasadigimiz @libsql native modul sorunu, ayni riski burada almiyoruz).
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
