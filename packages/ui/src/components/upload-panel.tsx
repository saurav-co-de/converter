import type { ToolDefinition } from "@pdf-platform/types";
import { Button } from "./button";

const optionPresets: Partial<Record<ToolDefinition["slug"], string[]>> = {
  "merge-pdf": ["Preserve bookmarks", "Merge in listed order", "Flatten forms"],
  "split-pdf": ["Every page", "Custom page ranges", "Extract selected pages"],
  "compress-pdf": ["Extreme compression", "Recommended balance", "High quality"],
  "protect-pdf": ["Open password", "Permission password", "Block printing"],
  "watermark-pdf": ["Text watermark", "Image watermark", "Apply to all pages"]
};

export function UploadPanel({ tool }: { tool: ToolDefinition }) {
  const options = optionPresets[tool.slug] ?? ["Preview options", "Batch ready", "Cloud import ready"];

  return (
    <section className="rounded-[32px] bg-ink p-6 text-white shadow-soft sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100">
              Upload-first flow
            </span>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{tool.title}</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-300">{tool.summary}</p>
          </div>
          <div className="rounded-[28px] border border-dashed border-white/25 bg-white/5 p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-200">Select files</p>
            <p className="mt-4 text-xl font-semibold">Drop files here or choose from your device</p>
            <p className="mt-3 text-sm text-slate-300">Google Drive and Dropbox connectors slot into this same entry point.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/signup">Select files</Button>
              <Button href="/security" variant="ghost">
                Security details
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatusCard label="Uploading" value="0 of 0" />
            <StatusCard label="Queue" value="Ready" />
            <StatusCard label="Retention" value="2 hours" />
          </div>
        </div>
        <div className="rounded-[28px] bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-100">Tool options</p>
          <div className="mt-5 space-y-3">
            {options.map((option) => (
              <div key={option} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                {option}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-white p-4 text-ink">
            <p className="text-sm font-semibold">Accepted inputs</p>
            <p className="mt-2 text-sm text-slate-600">{tool.accepts.join(", ")}</p>
          </div>
          <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-slate-200">
            Versioned options are carried in the job payload so worker updates do not break queued jobs.
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
