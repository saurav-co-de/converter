import { tools } from "@pdf-platform/types";
import { Container, PdfToJpgConverter, ToolCard } from "@pdf-platform/ui";

export default function HomePage() {
  return (
    <Container className="space-y-10 py-16 sm:py-20">
      <section className="mx-auto max-w-4xl space-y-6 text-center">
        <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 ring-1 ring-slate-200">
          Simple PDF converter
        </div>
        <h1 className="font-display text-5xl font-semibold leading-tight text-ink sm:text-6xl">
          Upload your PDF and download it as JPG.
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
          No account, no dashboard, no extra steps. Pick a PDF, convert it, and download the JPG.
        </p>
      </section>

      <div className="mx-auto max-w-6xl">
        <PdfToJpgConverter />
      </div>

      <section className="space-y-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Tools</h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            The service now shows the full tool catalog. `PDF to JPG` is available now, and the rest are listed for rollout next.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>
    </Container>
  );
}
