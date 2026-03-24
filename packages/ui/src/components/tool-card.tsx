import type { ToolDefinition } from "@pdf-platform/types";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <a
      className="group flex h-full flex-col justify-between rounded-[28px] bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-2xl"
      href={`/${tool.slug}`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{tool.category}</span>
          <div className="flex items-center gap-2">
            {tool.premium ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Premium</span>
            ) : null}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                tool.status === "available" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
              }`}
            >
              {tool.status === "available" ? "Available now" : "Coming soon"}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-ink">{tool.title}</h3>
          <p className="text-sm leading-6 text-slate-600">{tool.summary}</p>
        </div>
      </div>
      <span className="mt-6 text-sm font-semibold text-signal">
        {tool.status === "available" ? "Open tool" : "Open details"}
      </span>
    </a>
  );
}
