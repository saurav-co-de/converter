import { getEnv } from "@pdf-platform/config";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive()
});

export async function POST(request: Request) {
  const payload = bodySchema.parse(await request.json());
  const env = getEnv();
  const id = crypto.randomUUID();

  return NextResponse.json({
    uploadId: id,
    storageKey: `uploads/${id}/${payload.fileName}`,
    method: "PUT",
    uploadUrl: `${env.S3_ENDPOINT}/${env.S3_BUCKET}/uploads/${id}/${encodeURIComponent(payload.fileName)}`,
    expiresInSeconds: env.UPLOAD_URL_TTL_SECONDS,
    requiredHeaders: {
      "content-type": payload.mimeType
    }
  });
}
