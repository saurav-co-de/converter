import { NextResponse } from "next/server";
import { pdfJobRequestSchema, toolRequestSchema, usagePolicies } from "@pdf-platform/types";

export async function POST(request: Request) {
  const body = toolRequestSchema.parse(await request.json());
  const now = new Date();
  const expiresAt = new Date(now.getTime() + usagePolicies.anonymous.retentionHours * 60 * 60 * 1000);

  const job = pdfJobRequestSchema.parse({
    id: crypto.randomUUID(),
    tool: body.tool,
    status: "queued",
    planTier: "anonymous",
    sourceProvider: "local",
    retentionHours: usagePolicies.anonymous.retentionHours,
    toolRequest: body,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    userId: null,
    progressPercent: 0
  });

  return NextResponse.json({
    job,
    next: {
      statusUrl: `/api/jobs/${job.id}`,
      appUrl: `/jobs/${job.id}`
    }
  });
}
