import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

// Temporary diagnostic route — deleted once the Prisma engine bundling
// issue on Vercel is confirmed fixed. Lists what's actually present at
// runtime so we don't have to guess from error messages alone.
export async function GET() {
  const candidates = [
    path.join(process.cwd(), "src/generated/prisma"),
    "/var/task/src/generated/prisma",
    "/vercel/path0/src/generated/prisma",
  ];

  const result: Record<string, unknown> = { cwd: process.cwd() };

  for (const dir of candidates) {
    try {
      result[dir] = fs.readdirSync(dir);
    } catch (err) {
      result[dir] = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return NextResponse.json(result);
}
