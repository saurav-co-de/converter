import { getEnv } from "@pdf-platform/config";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const env = getEnv();

  return NextResponse.json({
    token,
    downloadUrl: `${env.NEXT_PUBLIC_APP_URL}/download/${token}`,
    expiresInSeconds: env.DOWNLOAD_URL_TTL_SECONDS,
    deleteNowUrl: `/api/files/${token}/delete`
  });
}
