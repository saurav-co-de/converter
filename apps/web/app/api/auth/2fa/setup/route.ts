import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    secret: "otpauth://totp/PDFFlow:user@example.com?secret=BASE32SECRET",
    recoveryCodes: ["sample-code-1", "sample-code-2", "sample-code-3"]
  });
}
