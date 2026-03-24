import { tools, usagePolicies } from "@pdf-platform/types";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    tools,
    usagePolicies
  });
}
