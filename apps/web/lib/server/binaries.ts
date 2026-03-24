import { promises as fs } from "fs";
import path from "path";

const WINDOWS_MUTOOl_WINGET_ROOT = path.join(
  process.env.LOCALAPPDATA ?? "",
  "Microsoft",
  "WinGet",
  "Packages",
  "ArtifexSoftware.mutool_Microsoft.Winget.Source_8wekyb3d8bbwe"
);

async function fileExists(candidate: string) {
  try {
    await fs.access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function collectWindowsMutoolCandidates() {
  const candidates: string[] = [];

  if (!(await fileExists(WINDOWS_MUTOOl_WINGET_ROOT))) {
    return candidates;
  }

  try {
    const versions = await fs.readdir(WINDOWS_MUTOOl_WINGET_ROOT);

    for (const versionDir of versions.reverse()) {
      candidates.push(path.join(WINDOWS_MUTOOl_WINGET_ROOT, versionDir, "mutool.exe"));
      candidates.push(path.join(WINDOWS_MUTOOl_WINGET_ROOT, versionDir, "mupdf-1.23.0-windows", "mutool.exe"));
    }
  } catch {
    return candidates;
  }

  return candidates;
}

export async function findBinary(binaryNames: string[], extraCandidates: string[] = []) {
  const candidates = new Set<string>();

  for (const entry of (process.env.PATH ?? "").split(path.delimiter).filter(Boolean)) {
    for (const binaryName of binaryNames) {
      candidates.add(path.join(entry, binaryName));
    }
  }

  for (const candidate of extraCandidates) {
    candidates.add(candidate);
  }

  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function findMutool() {
  return findBinary(["mutool", "mutool.exe"], [
    ...(await collectWindowsMutoolCandidates()),
    "/usr/bin/mutool",
    "/usr/local/bin/mutool"
  ]);
}

export async function findQpdf() {
  return findBinary(["qpdf", "qpdf.exe"], [
    "C:\\Program Files\\qpdf 12.3.2\\bin\\qpdf.exe",
    "C:\\Program Files\\qpdf\\bin\\qpdf.exe",
    "/usr/bin/qpdf",
    "/usr/local/bin/qpdf"
  ]);
}

export async function findMagick() {
  return findBinary(["magick", "magick.exe"], [
    "C:\\Program Files\\ImageMagick-7.1.2-Q16\\magick.exe",
    "/usr/bin/magick",
    "/usr/local/bin/magick"
  ]);
}

export async function findSoffice() {
  return findBinary(["soffice", "soffice.exe"], [
    "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
    "/usr/bin/soffice",
    "/usr/local/bin/soffice"
  ]);
}
