"use client";

import type { ToolDefinition } from "@pdf-platform/types";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";

type ToolState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; fileName: string; downloadUrl: string }
  | { status: "error"; message: string };

const supportedTools = new Set([
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-word",
  "pdf-to-powerpoint",
  "pdf-to-excel",
  "rotate-pdf",
  "html-to-pdf",
  "protect-pdf",
  "unlock-pdf",
  "organize-pdf",
  "jpg-to-pdf",
  "scan-to-pdf",
  "repair-pdf",
  "word-to-pdf",
  "powerpoint-to-pdf",
  "excel-to-pdf"
]);

export function WorkingToolPanel({ tool }: { tool: ToolDefinition }) {
  const [files, setFiles] = useState<File[]>([]);
  const [rotation, setRotation] = useState("90");
  const [password, setPassword] = useState("");
  const [pages, setPages] = useState("1");
  const [state, setState] = useState<ToolState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (state.status === "success") {
        URL.revokeObjectURL(state.downloadUrl);
      }
    };
  }, [state]);

  if (!supportedTools.has(tool.slug)) {
    return null;
  }

  const isMulti = tool.slug === "merge-pdf" || tool.slug === "jpg-to-pdf";
  const accept =
    tool.slug === "jpg-to-pdf"
      ? ".jpg,.jpeg,.png,.webp"
      : tool.slug === "word-to-pdf"
        ? ".doc,.docx,.odt,.rtf"
        : tool.slug === "powerpoint-to-pdf"
          ? ".ppt,.pptx,.odp"
          : tool.slug === "excel-to-pdf"
            ? ".xls,.xlsx,.ods,.csv"
            : tool.slug === "pdf-to-word" || tool.slug === "pdf-to-powerpoint" || tool.slug === "pdf-to-excel"
              ? ".pdf,application/pdf"
            : tool.slug === "scan-to-pdf"
              ? ".jpg,.jpeg,.png,.webp"
              : tool.slug === "html-to-pdf"
                ? ".html,.htm"
        : ".pdf,application/pdf";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (files.length === 0) {
      setState({ status: "error", message: "Choose file first." });
      return;
    }

    if ((tool.slug === "protect-pdf" || tool.slug === "unlock-pdf") && !password.trim()) {
      setState({ status: "error", message: "Enter a password first." });
      return;
    }

    if (state.status === "success") {
      URL.revokeObjectURL(state.downloadUrl);
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    if (tool.slug === "rotate-pdf") {
      formData.append("rotation", rotation);
    }

    if (tool.slug === "organize-pdf") {
      formData.append("pages", pages);
    }

    if (tool.slug === "protect-pdf" || tool.slug === "unlock-pdf") {
      formData.append("password", password);
    }

    setState({ status: "uploading" });

    try {
      const response = await fetch(`/api/run/${tool.slug}`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setState({
          status: "error",
          message: payload.error ?? "Tool execution failed."
        });
        return;
      }

      const blob = await response.blob();
      const fileName = response.headers.get("X-Output-File-Name") ?? "result";
      const downloadUrl = URL.createObjectURL(blob);

      setState({
        status: "success",
        fileName,
        downloadUrl
      });
    } catch {
      setState({
        status: "error",
        message: "The server could not process the file. Try again."
      });
    }
  }

  return (
    <section className="rounded-[32px] bg-ink p-6 text-white shadow-soft sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100">
              Working tool
            </span>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{tool.title}</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-300">{tool.summary}</p>
          </div>

          <form className="rounded-[28px] border border-dashed border-white/25 bg-white/5 p-8" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              accept={accept}
              className="hidden"
              multiple={isMulti}
              onChange={(event) => {
                setFiles(Array.from(event.target.files ?? []));
                setState({ status: "idle" });
              }}
              type="file"
            />

            <button
              className="block w-full cursor-pointer rounded-[24px] border border-white/10 bg-white/5 px-5 py-6 text-center transition hover:bg-white/10"
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-200">
                {isMulti ? "Select files" : "Select file"}
              </span>
              <span className="mt-3 block text-lg font-semibold text-white">
                {files.length > 0
                  ? files.length === 1
                    ? files[0].name
                    : `${files.length} files selected`
                  : `Choose ${tool.slug === "jpg-to-pdf" ? "image" : "PDF"} file${isMulti ? "s" : ""} from your device`}
              </span>
              <span className="mt-2 block text-sm text-slate-300">
                {tool.slug === "merge-pdf"
                  ? "Select multiple PDF files in the order you want to merge."
                  : tool.slug === "jpg-to-pdf" || tool.slug === "scan-to-pdf"
                    ? "Select one or more images to build a PDF."
                    : tool.slug === "word-to-pdf" ||
                        tool.slug === "powerpoint-to-pdf" ||
                        tool.slug === "excel-to-pdf" ||
                        tool.slug === "pdf-to-word" ||
                        tool.slug === "pdf-to-powerpoint" ||
                        tool.slug === "pdf-to-excel" ||
                        tool.slug === "html-to-pdf"
                      ? "Select a document file to convert to PDF."
                    : "Select a single PDF file to process."}
              </span>
            </button>

            {tool.slug === "rotate-pdf" ? (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-rose-100">Rotation</label>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
                  onChange={(event) => setRotation(event.target.value)}
                  value={rotation}
                >
                  <option value="90">90 degrees</option>
                  <option value="180">180 degrees</option>
                  <option value="270">270 degrees</option>
                </select>
              </div>
            ) : null}

            {tool.slug === "protect-pdf" || tool.slug === "unlock-pdf" ? (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-rose-100">Password</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  type="password"
                  value={password}
                />
              </div>
            ) : null}

            {tool.slug === "organize-pdf" ? (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-rose-100">Page order</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
                  onChange={(event) => setPages(event.target.value)}
                  placeholder="Example: 1,3,2"
                  type="text"
                  value={pages}
                />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="submit">{state.status === "uploading" ? "Processing..." : tool.title}</Button>
              <Button onClick={() => inputRef.current?.click()} type="button" variant="ghost">
                Choose file
              </Button>
              {state.status === "success" ? (
                <a
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100"
                  download={state.fileName}
                  href={state.downloadUrl}
                >
                  Download result
                </a>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-[28px] bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-100">Status</p>
          <div className="mt-5 space-y-3">
            <StatusLine label="Account" value="Not required" />
            <StatusLine label="Input" value={tool.accepts.join(", ")} />
            <StatusLine label="Output" value={tool.outputs.join(", ")} />
          </div>

          <div className="mt-6 rounded-2xl bg-white p-4 text-ink">
            {state.status === "idle" ? <Message title="Ready" body="Select files and run the tool." /> : null}
            {state.status === "uploading" ? <Message title="Processing" body="Your file is being processed on the server." /> : null}
            {state.status === "success" ? <Message title="Done" body={`${state.fileName} is ready to download.`} /> : null}
            {state.status === "error" ? <Message title="Error" body={state.message} error /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Message({ title, body, error = false }: { title: string; body: string; error?: boolean }) {
  return (
    <>
      <p className={`text-sm font-semibold ${error ? "text-rose-700" : ""}`}>{title}</p>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </>
  );
}
