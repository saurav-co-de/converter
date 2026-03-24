"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./button";

type ConversionState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; fileName: string; downloadUrl: string; width: number; height: number }
  | { status: "error"; message: string };

export function PdfToJpgConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ConversionState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (state.status === "success") {
        URL.revokeObjectURL(state.downloadUrl);
      }
    };
  }, [state]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setState({ status: "error", message: "Choose a PDF file first." });
      return;
    }

    if (state.status === "success") {
      URL.revokeObjectURL(state.downloadUrl);
    }

    const formData = new FormData();
    formData.append("file", file);

    setState({ status: "uploading" });

    try {
      const response = await fetch("/api/convert/pdf-to-jpg", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setState({
          status: "error",
          message: payload.error ?? "Conversion failed."
        });
        return;
      }

      const blob = await response.blob();
      const fileName = response.headers.get("X-Output-File-Name") ?? "converted.jpg";
      const width = Number(response.headers.get("X-Image-Width") ?? "0");
      const height = Number(response.headers.get("X-Image-Height") ?? "0");
      const downloadUrl = URL.createObjectURL(blob);

      setState({
        status: "success",
        fileName,
        downloadUrl,
        width,
        height
      });
    } catch {
      setState({
        status: "error",
        message: "The server could not process the file. Try again in a moment."
      });
    }
  }

  return (
    <section className="rounded-[32px] bg-ink p-6 text-white shadow-soft sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100">
              Anonymous conversion
            </span>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Upload PDF, get JPG</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              No account required. This version converts the first page of your PDF into a downloadable JPG.
            </p>
          </div>

          <form className="rounded-[28px] border border-dashed border-white/25 bg-white/5 p-8" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              accept="application/pdf"
              className="hidden"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                setState({ status: "idle" });
              }}
              type="file"
            />

            <button
              className="block w-full cursor-pointer rounded-[24px] border border-white/10 bg-white/5 px-5 py-6 text-center transition hover:bg-white/10"
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-200">Select PDF</span>
              <span className="mt-3 block text-lg font-semibold text-white">
                {file ? file.name : "Choose a PDF from your device"}
              </span>
              <span className="mt-2 block text-sm text-slate-300">Maximum 20MB. The first page will be rendered as JPG.</span>
              {file ? (
                <span className="mt-4 inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  File selected
                </span>
              ) : null}
            </button>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="submit">{state.status === "uploading" ? "Converting..." : "Convert to JPG"}</Button>
              <Button onClick={() => inputRef.current?.click()} type="button" variant="ghost">
                Choose file
              </Button>
              {state.status === "success" ? (
                <a
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-slate-100"
                  download={state.fileName}
                  href={state.downloadUrl}
                >
                  Download JPG
                </a>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-[28px] bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-100">Status</p>
          <div className="mt-5 space-y-3">
            <StatusLine label="Account" value="Not required" />
            <StatusLine label="Output" value="Single JPG image" />
            <StatusLine label="Retention" value="Returned immediately in browser" />
          </div>

          <div className="mt-6 rounded-2xl bg-white p-4 text-ink">
            {state.status === "idle" ? (
              <>
                <p className="text-sm font-semibold">Ready</p>
                <p className="mt-2 text-sm text-slate-600">Choose a PDF to start the conversion.</p>
              </>
            ) : null}

            {state.status === "uploading" ? (
              <>
                <p className="text-sm font-semibold">Processing</p>
                <p className="mt-2 text-sm text-slate-600">Rendering the first page into JPG.</p>
              </>
            ) : null}

            {state.status === "success" ? (
              <>
                <p className="text-sm font-semibold">Done</p>
                <p className="mt-2 text-sm text-slate-600">
                  {state.fileName} is ready. Size: {state.width} × {state.height}px.
                </p>
              </>
            ) : null}

            {state.status === "error" ? (
              <>
                <p className="text-sm font-semibold text-rose-700">Error</p>
                <p className="mt-2 text-sm text-slate-600">{state.message}</p>
              </>
            ) : null}
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
