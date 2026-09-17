import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "c1_session";
const SESSION_DAYS = 30;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

type SessionPayload = { userId: string };

export function createSessionToken(userId: string): string {
  return jwt.sign({ userId } satisfies SessionPayload, getSecret(), {
    expiresIn: `${SESSION_DAYS}d`,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  return prisma.user.findUnique({
    where: { id: payload.userId },
    include: { profile: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

/**
 * Use at the top of any page that requires both a logged-in user AND a
 * completed onboarding step (i.e. everything except /onboarding,
 * /placement-test and /settings, which must stay reachable to log out or
 * delete data). Onboarding is satisfied either by completing the real
 * placement test OR by explicitly choosing a level manually — see
 * src/app/(app)/onboarding.
 */
export async function requireOnboardedUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.profile?.onboardingCompleted) {
    redirect("/onboarding");
  }
  return user;
}

export { SESSION_COOKIE };
