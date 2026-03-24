import { NextResponse } from "next/server";
import { pdfJobResultSchema } from "@pdf-platform/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const result = pdfJobResultSchema.parse({
    jobId: id,
    status: "processing",
    progressPercent: 56,
    artifacts: [],
    errorCode: null,
    errorMessage: null,
    updatedAt: new Date().toISOString()
  });

  return NextResponse.json(result);
}
