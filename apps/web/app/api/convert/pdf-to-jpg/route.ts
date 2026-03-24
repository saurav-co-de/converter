import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { findMutool } from "../../../../lib/server/binaries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const execFileAsync = promisify(execFile);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a PDF file." }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "PDF is too large. Keep it under 20MB." }, { status: 400 });
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const mutoolBinary = await findMutool();

    if (!mutoolBinary) {
      return NextResponse.json(
        {
          error: "MuPDF mutool is not installed on this server yet."
        },
        { status: 500 }
      );
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-to-jpg-"));
    const inputPath = path.join(tempDir, "input.pdf");
    const outputPath = path.join(tempDir, "page-1.png");

    try {
      await fs.writeFile(inputPath, inputBuffer);
      await execFileAsync(mutoolBinary, ["draw", "-o", outputPath, "-r", "144", inputPath, "1"]);

      const image = sharp(outputPath);
      const metadata = await image.metadata();
      const outputBuffer = await image.jpeg({ quality: 90 }).toBuffer();
      const baseName = sanitizeFileName(file.name.replace(/\.pdf$/i, ""));
      const outputFileName = `${baseName || "converted"}.jpg`;

      return new NextResponse(new Uint8Array(outputBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Disposition": `attachment; filename="${outputFileName}"`,
          "X-Output-File-Name": outputFileName,
          "X-Image-Width": String(metadata.width ?? 0),
          "X-Image-Height": String(metadata.height ?? 0)
        }
      });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  } catch {
    return NextResponse.json(
      {
        error: "PDF conversion failed on the server."
      },
      { status: 500 }
    );
  }
}
