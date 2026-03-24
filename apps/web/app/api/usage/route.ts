import { usagePolicies } from "@pdf-platform/types";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    currentTier: "anonymous",
    policy: usagePolicies.anonymous
  });
}
