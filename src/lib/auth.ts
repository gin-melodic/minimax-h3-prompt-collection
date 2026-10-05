import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { scryptSync, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "h3_admin_session";

function sessionKey() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return new TextEncoder().encode(value);
}

export function verifyAdminSecret(secret: string) {
  const encoded = process.env.ADMIN_SECRET_HASH;
  if (!encoded) return false;
  const [salt, expectedHex] = encoded.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(secret, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function createAdminSession() {
  const maxAge = Number(process.env.SESSION_MAX_AGE_SECONDS || 604800);
  const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime(`${maxAge}s`).sign(sessionKey());
  const store = await cookies();
  store.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge });
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, sessionKey());
    return payload.role === "admin";
  } catch { return false; }
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}
