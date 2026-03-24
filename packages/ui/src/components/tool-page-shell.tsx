import type { ToolDefinition } from "@pdf-platform/types";
import { Button } from "./button";

export function ToolPageShell({ tool }: { tool: ToolDefinition }) {
  return (
    <section className="rounded-[32px] bg-ink p-6 text-white shadow-soft sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100">
              {tool.status === "available" ? "Available now" : "Coming soon"}
            </span>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">{tool.title}</h2>
            <p className="max-w-2xl text-base leading-7 text-slate-300">{tool.summary}</p>
          </div>

          <div className="rounded-[28px] border border-dashed border-white/25 bg-white/5 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-200">Upload flow</p>
            <p className="mt-4 text-xl font-semibold">
              {tool.status === "available"
                ? "This tool is live now."
                : "This tool page is added and ready for its processing backend."}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Accepted inputs: {tool.accepts.join(", ")}. Output: {tool.outputs.join(", ")}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/">Back to home</Button>
              {tool.status === "available" ? null : (
                <Button href="/pdf-to-jpg" variant="ghost">
                  Open working tool
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white/5 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-100">Tool details</p>
          <div className="mt-5 space-y-3">
            <InfoRow label="Category" value={tool.category} />
            <InfoRow label="Input" value={tool.accepts.join(", ")} />
            <InfoRow label="Output" value={tool.outputs.join(", ")} />
            <InfoRow label="Engine" value={tool.engines.join(", ")} />
          </div>

          <div className="mt-6 rounded-2xl bg-white p-4 text-ink">
            <p className="text-sm font-semibold">Status</p>
            <p className="mt-2 text-sm text-slate-600">
              {tool.status === "available"
                ? "This tool is available for direct use."
                : "The tool has been added to the app and is ready for backend implementation."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
