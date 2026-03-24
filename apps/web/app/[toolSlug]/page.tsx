import { notFound } from "next/navigation";
import { tools } from "@pdf-platform/types";
import { Container, PdfToJpgConverter, ToolPageShell, WorkingToolPanel } from "@pdf-platform/ui";

export function generateStaticParams() {
  return tools.map((tool) => ({ toolSlug: tool.slug }));
}

export default async function ToolPage({ params }: { params: Promise<{ toolSlug: string }> }) {
  const { toolSlug } = await params;
  const tool = tools.find((item) => item.slug === toolSlug);

  if (!tool) {
    notFound();
  }

  return (
    <Container className="space-y-10 py-16 sm:py-20">
      <section className="mx-auto max-w-4xl space-y-4 text-center">
        <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 ring-1 ring-slate-200">
          {tool.category}
        </div>
        <h1 className="font-display text-5xl font-semibold leading-tight text-ink sm:text-6xl">{tool.title}</h1>
        <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-600">{tool.summary}</p>
      </section>

      <div className="mx-auto max-w-6xl">
        {tool.slug === "pdf-to-jpg" ? (
          <PdfToJpgConverter />
        ) : tool.status === "available" ? (
          <WorkingToolPanel tool={tool} />
        ) : (
          <ToolPageShell tool={tool} />
        )}
      </div>
    </Container>
  );
}
