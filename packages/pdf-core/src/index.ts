import type { PdfJobRequest, ToolSlug } from "@pdf-platform/types";
import { tools } from "@pdf-platform/types";

export type ToolAdapter = {
  tool: ToolSlug;
  engines: string[];
  execute(job: PdfJobRequest): Promise<{ outputKeys: string[] }>;
};

function buildOutputExtension(tool: ToolSlug) {
  return tool === "pdf-to-jpg" ? "jpg" : "pdf";
}

function createAdapter(tool: ToolSlug): ToolAdapter {
  const definition = tools.find((entry) => entry.slug === tool);

  return {
    tool,
    engines: definition?.engines ?? ["placeholder"],
    async execute(job) {
      const extension = buildOutputExtension(tool);
      const baseKey = `jobs/${job.id}/${tool}`;

      if (tool === "pdf-to-jpg") {
        return {
          outputKeys: job.toolRequest.inputFiles.map((_, index) => `${baseKey}-page-${index + 1}.${extension}`)
        };
      }

      return {
        outputKeys: [`${baseKey}-output.${extension}`]
      };
    }
  };
}

const registry = new Map<ToolSlug, ToolAdapter>(
  tools.map((tool) => [tool.slug, createAdapter(tool.slug)])
);

export function getToolAdapter(tool: ToolSlug) {
  return registry.get(tool);
}
