import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { findMagick, findMutool, findQpdf, findSoffice } from "../../../../lib/server/binaries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const MAX_FILE_SIZE = 50 * 1024 * 1024;

async function extractPdfText(mutool: string, inputPath: string, outputPath: string) {
  await runCommandWithOutput(mutool, ["convert", "-F", "text", "-o", outputPath, inputPath], outputPath);
  return fs.readFile(outputPath, "utf8");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function zipPackage(packageDir: string, destinationPath: string) {
  const zipPath = destinationPath.replace(/\.(docx|pptx|xlsx)$/i, ".zip");
  const zipBinary = process.platform === "win32" ? "powershell.exe" : "zip";
  const zipArgs =
    process.platform === "win32"
      ? [
          "-NoProfile",
          "-Command",
          `Compress-Archive -Path '${packageDir}\\*' -DestinationPath '${zipPath}' -Force`
        ]
      : ["-r", zipPath, "."];

  await execFileAsync(zipBinary, zipArgs, {
    cwd: process.platform === "win32" ? undefined : packageDir
  });
  await fs.rename(zipPath, destinationPath);
}

async function createDocxFromText(tempDir: string, text: string, baseName: string) {
  const packageDir = path.join(tempDir, "docx");
  await fs.mkdir(path.join(packageDir, "_rels"), { recursive: true });
  await fs.mkdir(path.join(packageDir, "word", "_rels"), { recursive: true });

  const paragraphs = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`)
    .join("");

  await fs.writeFile(
    path.join(packageDir, "[Content_Types].xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  await fs.writeFile(
    path.join(packageDir, "_rels", ".rels"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  await fs.writeFile(
    path.join(packageDir, "word", "document.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${paragraphs || "<w:p/>"}<w:sectPr/></w:body>
</w:document>`
  );

  await fs.writeFile(
    path.join(packageDir, "word", "_rels", "document.xml.rels"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`
  );

  const outputPath = path.join(tempDir, `${baseName}.docx`);
  await zipPackage(packageDir, outputPath);
  return outputPath;
}

async function createXlsxFromText(tempDir: string, text: string, baseName: string) {
  const packageDir = path.join(tempDir, "xlsx");
  await fs.mkdir(path.join(packageDir, "_rels"), { recursive: true });
  await fs.mkdir(path.join(packageDir, "xl", "_rels"), { recursive: true });
  await fs.mkdir(path.join(packageDir, "xl", "worksheets"), { recursive: true });

  const rows = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map(
      (line, index) =>
        `<row r="${index + 1}"><c r="A${index + 1}" t="inlineStr"><is><t>${escapeXml(line)}</t></is></c></row>`
    )
    .join("");

  await fs.writeFile(
    path.join(packageDir, "[Content_Types].xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
  );

  await fs.writeFile(
    path.join(packageDir, "_rels", ".rels"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );

  await fs.writeFile(
    path.join(packageDir, "xl", "workbook.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="PDF Text" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
  );

  await fs.writeFile(
    path.join(packageDir, "xl", "_rels", "workbook.xml.rels"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
  );

  await fs.writeFile(
    path.join(packageDir, "xl", "worksheets", "sheet1.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rows || '<row r="1"><c r="A1" t="inlineStr"><is><t></t></is></c></row>'}</sheetData>
</worksheet>`
  );

  const outputPath = path.join(tempDir, `${baseName}.xlsx`);
  await zipPackage(packageDir, outputPath);
  return outputPath;
}

async function createPptxFromImages(tempDir: string, imagePaths: string[], baseName: string) {
  const packageDir = path.join(tempDir, "pptx");
  await fs.mkdir(path.join(packageDir, "_rels"), { recursive: true });
  await fs.mkdir(path.join(packageDir, "ppt", "_rels"), { recursive: true });
  await fs.mkdir(path.join(packageDir, "ppt", "slides", "_rels"), { recursive: true });
  await fs.mkdir(path.join(packageDir, "ppt", "media"), { recursive: true });

  const contentOverrides = imagePaths
    .map(
      (_, index) =>
        `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
    )
    .join("");

  const slideRelationships = imagePaths
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`
    )
    .join("");

  const slideIds = imagePaths
    .map((_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 1}"/>`)
    .join("");

  await fs.writeFile(
    path.join(packageDir, "[Content_Types].xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${contentOverrides}
</Types>`
  );

  await fs.writeFile(
    path.join(packageDir, "_rels", ".rels"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  await fs.writeFile(
    path.join(packageDir, "ppt", "presentation.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>${slideIds}</p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`
  );

  await fs.writeFile(
    path.join(packageDir, "ppt", "_rels", "presentation.xml.rels"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${slideRelationships}
</Relationships>`
  );

  for (let index = 0; index < imagePaths.length; index += 1) {
    const imageName = `image${index + 1}.png`;
    await fs.copyFile(imagePaths[index], path.join(packageDir, "ppt", "media", imageName));

    await fs.writeFile(
      path.join(packageDir, "ppt", "slides", `slide${index + 1}.xml`),
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="Picture ${index + 1}"/>
          <p:cNvPicPr/>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId1"/>
          <a:stretch><a:fillRect/></a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm><a:off x="0" y="0"/><a:ext cx="9144000" cy="6858000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`
    );

    await fs.writeFile(
      path.join(packageDir, "ppt", "slides", "_rels", `slide${index + 1}.xml.rels`),
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${imageName}"/>
</Relationships>`
    );
  }

  const outputPath = path.join(tempDir, `${baseName}.pptx`);
  await zipPackage(packageDir, outputPath);
  return outputPath;
}

async function getFiles(formData: FormData) {
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    throw new Error("Choose file first.");
  }

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File is too large.");
    }
  }

  return files;
}

function safeBaseName(name: string, fallback: string) {
  const sanitized = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "-");
  return sanitized || fallback;
}

async function writeFiles(tempDir: string, files: File[]) {
  const filePaths: string[] = [];

  for (const file of files) {
    const filePath = path.join(tempDir, file.name.replace(/[^a-zA-Z0-9._-]/g, "-"));
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    filePaths.push(filePath);
  }

  return filePaths;
}

async function runCommandWithOutput(binary: string, args: string[], outputPath: string) {
  try {
    await execFileAsync(binary, args);
  } catch (error) {
    try {
      await fs.access(outputPath);
    } catch {
      throw error;
    }
  }
}

async function tryCommandWithOutput(binary: string, args: string[], outputPath: string) {
  try {
    await runCommandWithOutput(binary, args, outputPath);
    return true;
  } catch {
    try {
      await fs.access(outputPath);
      return true;
    } catch {
      return false;
    }
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ toolSlug: string }> }) {
  const { toolSlug } = await params;
  const formData = await request.formData();

  try {
    const files = await getFiles(formData);
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `tool-${toolSlug}-`));

    try {
      const inputPaths = await writeFiles(tempDir, files);

      if (toolSlug === "merge-pdf") {
        const mutool = await findMutool();
        if (!mutool) {
          throw new Error("MuPDF is not installed.");
        }

        const outputPath = path.join(tempDir, "merged.pdf");
        await execFileAsync(mutool, ["merge", "-o", outputPath, ...inputPaths]);
        const outputBuffer = await fs.readFile(outputPath);

        return fileResponse(outputBuffer, "merged.pdf", "application/pdf");
      }

      if (toolSlug === "split-pdf") {
        const qpdf = await findQpdf();
        if (!qpdf) {
          throw new Error("qpdf is not installed.");
        }

        const pattern = path.join(tempDir, "split-%d.pdf");
        await runCommandWithOutput(qpdf, ["--split-pages", inputPaths[0], pattern], pattern.replace("%d", "1"));
        const splitFiles = (await fs.readdir(tempDir))
          .filter((file) => file.startsWith("split-") && file.endsWith(".pdf"))
          .sort();

        if (splitFiles.length === 0) {
          throw new Error("No split output was created.");
        }

        const outputBuffer = await fs.readFile(path.join(tempDir, splitFiles[0]));
        return fileResponse(outputBuffer, splitFiles[0], "application/pdf");
      }

      if (toolSlug === "compress-pdf" || toolSlug === "repair-pdf") {
        const mutool = await findMutool();
        const outputName = toolSlug === "repair-pdf" ? "repaired.pdf" : "compressed.pdf";
        const outputPath = path.join(tempDir, outputName);

        let created = false;

        if (mutool) {
          created = await tryCommandWithOutput(mutool, ["clean", "-z", "-f", "-i", inputPaths[0], outputPath], outputPath);
        }

        if (!created) {
          const qpdf = await findQpdf();

          if (qpdf) {
            created = await tryCommandWithOutput(qpdf, ["--linearize", inputPaths[0], outputPath], outputPath);
          }
        }

        if (!created) {
          throw new Error(
            toolSlug === "repair-pdf"
              ? "This PDF could not be repaired on the server."
              : "This PDF could not be compressed on the server."
          );
        }

        const outputBuffer = await fs.readFile(outputPath);
        return fileResponse(outputBuffer, outputName, "application/pdf");
      }

      if (toolSlug === "rotate-pdf") {
        const qpdf = await findQpdf();
        if (!qpdf) {
          throw new Error("qpdf is not installed.");
        }

        const rotation = String(formData.get("rotation") ?? "90");
        const degrees = ["90", "180", "270"].includes(rotation) ? rotation : "90";
        const outputPath = path.join(tempDir, "rotated.pdf");
        await runCommandWithOutput(qpdf, [`--rotate=+${degrees}`, "--", inputPaths[0], outputPath], outputPath);
        const outputBuffer = await fs.readFile(outputPath);

        return fileResponse(outputBuffer, "rotated.pdf", "application/pdf");
      }

      if (toolSlug === "protect-pdf") {
        const qpdf = await findQpdf();
        if (!qpdf) {
          throw new Error("qpdf is not installed.");
        }

        const password = String(formData.get("password") ?? "");
        if (!password) {
          throw new Error("Password is required.");
        }

        const outputPath = path.join(tempDir, "protected.pdf");
        await runCommandWithOutput(qpdf, ["--encrypt", password, password, "256", "--", inputPaths[0], outputPath], outputPath);
        const outputBuffer = await fs.readFile(outputPath);

        return fileResponse(outputBuffer, "protected.pdf", "application/pdf");
      }

      if (toolSlug === "unlock-pdf") {
        const qpdf = await findQpdf();
        if (!qpdf) {
          throw new Error("qpdf is not installed.");
        }

        const password = String(formData.get("password") ?? "");
        if (!password) {
          throw new Error("Password is required.");
        }

        const outputPath = path.join(tempDir, "unlocked.pdf");
        await runCommandWithOutput(qpdf, [`--password=${password}`, "--decrypt", inputPaths[0], outputPath], outputPath);
        const outputBuffer = await fs.readFile(outputPath);

        return fileResponse(outputBuffer, "unlocked.pdf", "application/pdf");
      }

      if (toolSlug === "jpg-to-pdf" || toolSlug === "scan-to-pdf") {
        const magick = await findMagick();
        if (!magick) {
          throw new Error("ImageMagick is not installed.");
        }

        const outputPath = path.join(tempDir, "images.pdf");
        await execFileAsync(magick, [...inputPaths, outputPath]);
        const outputBuffer = await fs.readFile(outputPath);

        return fileResponse(outputBuffer, "images.pdf", "application/pdf");
      }

      if (toolSlug === "organize-pdf") {
        const qpdf = await findQpdf();
        if (!qpdf) {
          throw new Error("qpdf is not installed.");
        }

        const pages = String(formData.get("pages") ?? "").trim() || "1";
        const outputPath = path.join(tempDir, "organized.pdf");
        await runCommandWithOutput(qpdf, ["--empty", "--pages", inputPaths[0], pages, "--", outputPath], outputPath);
        const outputBuffer = await fs.readFile(outputPath);
        return fileResponse(outputBuffer, "organized.pdf", "application/pdf");
      }

      if (
        toolSlug === "word-to-pdf" ||
        toolSlug === "powerpoint-to-pdf" ||
        toolSlug === "excel-to-pdf" ||
        toolSlug === "html-to-pdf"
      ) {
        const soffice = await findSoffice();
        if (!soffice) {
          throw new Error("LibreOffice is not installed.");
        }

        await execFileAsync(soffice, ["--headless", "--convert-to", "pdf", "--outdir", tempDir, inputPaths[0]]);
        const pdfFiles = (await fs.readdir(tempDir)).filter((file) => file.toLowerCase().endsWith(".pdf"));
        const sourceBase = safeBaseName(files[0].name, "converted");
        const outputName = `${sourceBase}.pdf`;
        const generated = pdfFiles.find((file) => file !== path.basename(inputPaths[0])) ?? pdfFiles[0];

        if (!generated) {
          throw new Error("LibreOffice did not produce a PDF.");
        }

        const outputBuffer = await fs.readFile(path.join(tempDir, generated));
        return fileResponse(outputBuffer, outputName, "application/pdf");
      }

      if (toolSlug === "pdf-to-word" || toolSlug === "pdf-to-excel" || toolSlug === "pdf-to-powerpoint") {
        const mutool = await findMutool();
        if (!mutool) {
          throw new Error("MuPDF is not installed.");
        }

        const sourceBase = safeBaseName(files[0].name, "converted");

        if (toolSlug === "pdf-to-word") {
          const textPath = path.join(tempDir, "content.txt");
          const text = await extractPdfText(mutool, inputPaths[0], textPath);
          const outputPath = await createDocxFromText(tempDir, text, sourceBase);
          const outputBuffer = await fs.readFile(outputPath);
          return fileResponse(
            outputBuffer,
            `${sourceBase}.docx`,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          );
        }

        if (toolSlug === "pdf-to-excel") {
          const textPath = path.join(tempDir, "content.txt");
          const text = await extractPdfText(mutool, inputPaths[0], textPath);
          const outputPath = await createXlsxFromText(tempDir, text, sourceBase);
          const outputBuffer = await fs.readFile(outputPath);
          return fileResponse(
            outputBuffer,
            `${sourceBase}.xlsx`,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
        }

        const imagePattern = path.join(tempDir, "slide-%d.png");
        await execFileAsync(mutool, ["draw", "-o", imagePattern, "-r", "144", inputPaths[0]]);
        const imagePaths = (await fs.readdir(tempDir))
          .filter((file) => file.startsWith("slide-") && file.endsWith(".png"))
          .sort()
          .map((file) => path.join(tempDir, file));

        if (imagePaths.length === 0) {
          throw new Error("The PDF could not be rendered into presentation slides.");
        }

        const outputPath = await createPptxFromImages(tempDir, imagePaths, sourceBase);
        const outputBuffer = await fs.readFile(outputPath);
        return fileResponse(
          outputBuffer,
          `${sourceBase}.pptx`,
          "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        );
      }

      return NextResponse.json({ error: "Tool is not wired yet." }, { status: 400 });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tool execution failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function fileResponse(buffer: Buffer, fileName: string, contentType: string) {
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "X-Output-File-Name": fileName
    }
  });
}
