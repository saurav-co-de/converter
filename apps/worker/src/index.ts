import { getEnv, createLogger } from "@pdf-platform/config";
import { getToolAdapter } from "@pdf-platform/pdf-core";
import type { PdfJobRequest, PdfJobResult } from "@pdf-platform/types";

const env = getEnv();
const logger = createLogger("worker");

async function main() {
  logger.info("worker_started", {
    redisUrl: env.REDIS_URL,
    bucket: env.S3_BUCKET,
    retentionHours: env.FILE_RETENTION_HOURS
  });

  const exampleJob: PdfJobRequest = {
    id: crypto.randomUUID(),
    tool: "merge-pdf",
    status: "queued",
    planTier: "anonymous",
    sourceProvider: "local",
    retentionHours: env.FILE_RETENTION_HOURS,
    toolRequest: {
      version: "1",
      tool: "merge-pdf",
      inputFiles: [
        {
          id: crypto.randomUUID(),
          name: "sample-a.pdf",
          mimeType: "application/pdf",
          size: 1024,
          storageKey: "uploads/sample-a.pdf"
        },
        {
          id: crypto.randomUUID(),
          name: "sample-b.pdf",
          mimeType: "application/pdf",
          size: 2048,
          storageKey: "uploads/sample-b.pdf"
        }
      ],
      options: {
        preserveBookmarks: true
      }
    },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + env.FILE_RETENTION_HOURS * 60 * 60 * 1000).toISOString(),
    userId: null,
    progressPercent: 0
  };

  const result = await processJob(exampleJob);
  logger.info("worker_example_complete", result);
}

export async function processJob(job: PdfJobRequest): Promise<PdfJobResult> {
  const adapter = getToolAdapter(job.tool);

  if (!adapter) {
    return {
      jobId: job.id,
      status: "failed",
      progressPercent: 100,
      artifacts: [],
      errorCode: "ADAPTER_NOT_IMPLEMENTED",
      errorMessage: `No adapter is registered for ${job.tool}.`,
      updatedAt: new Date().toISOString()
    };
  }

  logger.info("job_processing_started", {
    id: job.id,
    tool: job.tool,
    engines: adapter.engines
  });

  const execution = await adapter.execute(job);

  return {
    jobId: job.id,
    status: "complete",
    progressPercent: 100,
    artifacts: execution.outputKeys.map((outputKey, index) => ({
      id: `${job.id}-${index + 1}`,
      fileName: outputKey.split("/").pop() ?? `artifact-${index + 1}`,
      mimeType: outputKey.endsWith(".jpg") ? "image/jpeg" : "application/pdf",
      storageKey: outputKey,
      size: 0,
      downloadToken: crypto.randomUUID()
    })),
    errorCode: null,
    errorMessage: null,
    updatedAt: new Date().toISOString()
  };
}

void main();
