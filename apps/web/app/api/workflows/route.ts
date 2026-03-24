import { NextResponse } from "next/server";
import { z } from "zod";

const workflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  steps: z
    .array(
      z.object({
        tool: z.string().min(1),
        version: z.string().min(1),
        options: z.record(z.string(), z.unknown())
      })
    )
    .min(1)
});

export async function POST(request: Request) {
  const body = workflowSchema.parse(await request.json());

  return NextResponse.json({
    workflow: {
      id: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString()
    }
  });
}
