import { z } from "zod";

export const toolSlugSchema = z.enum([
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-word",
  "pdf-to-powerpoint",
  "pdf-to-excel",
  "word-to-pdf",
  "powerpoint-to-pdf",
  "excel-to-pdf",
  "edit-pdf",
  "protect-pdf",
  "sign-pdf",
  "watermark-pdf",
  "rotate-pdf",
  "html-to-pdf",
  "unlock-pdf",
  "organize-pdf",
  "pdf-to-pdfa",
  "repair-pdf",
  "page-numbers",
  "scan-to-pdf",
  "ocr-pdf",
  "compare-pdf",
  "redact-pdf",
  "crop-pdf",
  "ai-summarizer",
  "translate-pdf",
  "workflow-builder",
  "jpg-to-pdf",
  "pdf-to-jpg"
]);

export type ToolSlug = z.infer<typeof toolSlugSchema>;

export const planTierSchema = z.enum([
  "anonymous",
  "free",
  "premium",
  "business"
]);

export type PlanTier = z.infer<typeof planTierSchema>;

export const sourceProviderSchema = z.enum([
  "local",
  "google_drive",
  "dropbox"
]);

export type SourceProvider = z.infer<typeof sourceProviderSchema>;

export const jobStatusSchema = z.enum([
  "uploading",
  "validating",
  "queued",
  "processing",
  "complete",
  "failed",
  "expired",
  "cancelled"
]);

export type JobStatus = z.infer<typeof jobStatusSchema>;

export const storedFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  storageKey: z.string()
});

export type StoredFile = z.infer<typeof storedFileSchema>;

export const toolRequestSchema = z.object({
  version: z.string(),
  tool: toolSlugSchema,
  inputFiles: z.array(storedFileSchema).min(1),
  options: z.record(z.string(), z.unknown()).default({})
});

export type ToolRequest = z.infer<typeof toolRequestSchema>;

export const pdfJobRequestSchema = z.object({
  id: z.string(),
  tool: toolSlugSchema,
  status: jobStatusSchema,
  planTier: planTierSchema,
  sourceProvider: sourceProviderSchema,
  retentionHours: z.number().int().positive(),
  toolRequest: toolRequestSchema,
  createdAt: z.string(),
  expiresAt: z.string(),
  userId: z.string().nullable(),
  progressPercent: z.number().min(0).max(100)
});

export type PdfJobRequest = z.infer<typeof pdfJobRequestSchema>;

export const artifactSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  storageKey: z.string(),
  size: z.number().int().nonnegative(),
  downloadToken: z.string()
});

export type Artifact = z.infer<typeof artifactSchema>;

export const pdfJobResultSchema = z.object({
  jobId: z.string(),
  status: z.enum(["processing", "complete", "failed"]),
  progressPercent: z.number().min(0).max(100),
  artifacts: z.array(artifactSchema),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  updatedAt: z.string()
});

export type PdfJobResult = z.infer<typeof pdfJobResultSchema>;

export const usagePolicySchema = z.object({
  tier: planTierSchema,
  maxFileSizeMb: z.number().int().positive(),
  maxFilesPerJob: z.number().int().positive(),
  maxConcurrentJobs: z.number().int().positive(),
  dailyJobs: z.number().int().positive(),
  retentionHours: z.number().int().positive()
});

export type UsagePolicy = z.infer<typeof usagePolicySchema>;

export const toolDefinitionSchema = z.object({
  slug: toolSlugSchema,
  title: z.string(),
  summary: z.string(),
  category: z.string(),
  status: z.enum(["available", "coming-soon"]),
  premium: z.boolean(),
  accepts: z.array(z.string()).min(1),
  outputs: z.array(z.string()).min(1),
  engines: z.array(z.string()).min(1),
  accent: z.string()
});

export type ToolDefinition = z.infer<typeof toolDefinitionSchema>;

export const navigationLinks = [
  { href: "/tools", label: "Tools" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/workflows", label: "Workflows" }
] as const;

export const usagePolicies: Record<PlanTier, UsagePolicy> = {
  anonymous: {
    tier: "anonymous",
    maxFileSizeMb: 50,
    maxFilesPerJob: 5,
    maxConcurrentJobs: 1,
    dailyJobs: 10,
    retentionHours: 2
  },
  free: {
    tier: "free",
    maxFileSizeMb: 100,
    maxFilesPerJob: 20,
    maxConcurrentJobs: 2,
    dailyJobs: 50,
    retentionHours: 12
  },
  premium: {
    tier: "premium",
    maxFileSizeMb: 500,
    maxFilesPerJob: 50,
    maxConcurrentJobs: 5,
    dailyJobs: 500,
    retentionHours: 24
  },
  business: {
    tier: "business",
    maxFileSizeMb: 1024,
    maxFilesPerJob: 100,
    maxConcurrentJobs: 20,
    dailyJobs: 5000,
    retentionHours: 72
  }
};

export const tools: ToolDefinition[] = [
  {
    slug: "merge-pdf",
    title: "Merge PDF",
    summary: "Combine PDFs in the order you want with the easiest PDF merger available.",
    category: "organize",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["qpdf", "ghostscript"],
    accent: "from-sun via-signal to-tide"
  },
  {
    slug: "split-pdf",
    title: "Split PDF",
    summary: "Separate one page or a whole set for easy conversion into independent PDF files.",
    category: "organize",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["qpdf"],
    accent: "from-cyan-400 via-sky-500 to-indigo-500"
  },
  {
    slug: "compress-pdf",
    title: "Compress PDF",
    summary: "Reduce file size while optimizing for maximal PDF quality.",
    category: "optimize",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["ghostscript"],
    accent: "from-tide via-emerald-500 to-cyan-500"
  },
  {
    slug: "pdf-to-word",
    title: "PDF to Word",
    summary: "Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.",
    category: "convert from pdf",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["DOC", "DOCX"],
    engines: ["libreoffice", "custom"],
    accent: "from-blue-500 via-cyan-500 to-sky-400"
  },
  {
    slug: "pdf-to-powerpoint",
    title: "PDF to PowerPoint",
    summary: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
    category: "convert from pdf",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PPT", "PPTX"],
    engines: ["libreoffice", "custom"],
    accent: "from-orange-500 via-amber-500 to-yellow-400"
  },
  {
    slug: "pdf-to-excel",
    title: "PDF to Excel",
    summary: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
    category: "convert from pdf",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["XLS", "XLSX"],
    engines: ["custom"],
    accent: "from-emerald-500 via-green-500 to-lime-400"
  },
  {
    slug: "word-to-pdf",
    title: "Word to PDF",
    summary: "Make DOC and DOCX files easy to read by converting them to PDF.",
    category: "convert to pdf",
    status: "available",
    premium: false,
    accepts: ["DOC", "DOCX"],
    outputs: ["PDF"],
    engines: ["libreoffice"],
    accent: "from-sky-500 via-blue-500 to-indigo-500"
  },
  {
    slug: "powerpoint-to-pdf",
    title: "PowerPoint to PDF",
    summary: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
    category: "convert to pdf",
    status: "available",
    premium: false,
    accepts: ["PPT", "PPTX"],
    outputs: ["PDF"],
    engines: ["libreoffice"],
    accent: "from-orange-500 via-red-500 to-rose-500"
  },
  {
    slug: "excel-to-pdf",
    title: "Excel to PDF",
    summary: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
    category: "convert to pdf",
    status: "available",
    premium: false,
    accepts: ["XLS", "XLSX"],
    outputs: ["PDF"],
    engines: ["libreoffice"],
    accent: "from-green-500 via-emerald-500 to-teal-500"
  },
  {
    slug: "edit-pdf",
    title: "Edit PDF",
    summary: "Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.",
    category: "edit",
    status: "coming-soon",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["custom"],
    accent: "from-violet-500 via-fuchsia-500 to-rose-500"
  },
  {
    slug: "protect-pdf",
    title: "Protect PDF",
    summary: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    category: "security",
    status: "available",
    premium: true,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["qpdf"],
    accent: "from-slate-700 via-slate-900 to-signal"
  },
  {
    slug: "sign-pdf",
    title: "Sign PDF",
    summary: "Sign yourself or request electronic signatures from others.",
    category: "security",
    status: "coming-soon",
    premium: true,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["custom"],
    accent: "from-amber-500 via-orange-500 to-rose-500"
  },
  {
    slug: "watermark-pdf",
    title: "Watermark PDF",
    summary: "Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.",
    category: "security",
    status: "coming-soon",
    premium: true,
    accepts: ["PDF", "PNG", "JPG"],
    outputs: ["PDF"],
    engines: ["ghostscript", "imagemagick"],
    accent: "from-amber-400 via-orange-500 to-rose-500"
  },
  {
    slug: "rotate-pdf",
    title: "Rotate PDF",
    summary: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
    category: "edit",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["qpdf"],
    accent: "from-indigo-500 via-blue-500 to-cyan-500"
  },
  {
    slug: "html-to-pdf",
    title: "HTML to PDF",
    summary: "Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF with a click.",
    category: "convert to pdf",
    status: "available",
    premium: false,
    accepts: ["URL", "HTML"],
    outputs: ["PDF"],
    engines: ["playwright", "custom"],
    accent: "from-slate-500 via-zinc-600 to-slate-800"
  },
  {
    slug: "unlock-pdf",
    title: "Unlock PDF",
    summary: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    category: "security",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["qpdf"],
    accent: "from-cyan-500 via-sky-500 to-blue-600"
  },
  {
    slug: "organize-pdf",
    title: "Organize PDF",
    summary: "Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience.",
    category: "organize",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["qpdf"],
    accent: "from-purple-500 via-indigo-500 to-sky-500"
  },
  {
    slug: "pdf-to-pdfa",
    title: "PDF to PDF/A",
    summary: "Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving. Your PDF will preserve formatting when accessed in the future.",
    category: "convert from pdf",
    status: "coming-soon",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF/A"],
    engines: ["ghostscript"],
    accent: "from-stone-500 via-slate-500 to-zinc-700"
  },
  {
    slug: "repair-pdf",
    title: "Repair PDF",
    summary: "Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.",
    category: "optimize",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["ghostscript", "qpdf"],
    accent: "from-red-500 via-orange-500 to-amber-500"
  },
  {
    slug: "page-numbers",
    title: "Page numbers",
    summary: "Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.",
    category: "edit",
    status: "coming-soon",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["custom"],
    accent: "from-fuchsia-500 via-pink-500 to-rose-500"
  },
  {
    slug: "scan-to-pdf",
    title: "Scan to PDF",
    summary: "Capture document scans from your mobile device and send them instantly to your browser.",
    category: "convert to pdf",
    status: "available",
    premium: false,
    accepts: ["Images", "Camera"],
    outputs: ["PDF"],
    engines: ["custom"],
    accent: "from-teal-500 via-cyan-500 to-sky-500"
  },
  {
    slug: "ocr-pdf",
    title: "OCR PDF",
    summary: "Easily convert scanned PDF into searchable and selectable documents.",
    category: "optimize",
    status: "coming-soon",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["tesseract"],
    accent: "from-lime-500 via-green-500 to-emerald-500"
  },
  {
    slug: "compare-pdf",
    title: "Compare PDF",
    summary: "Show a side-by-side document comparison and easily spot changes between different file versions.",
    category: "security",
    status: "coming-soon",
    premium: false,
    accepts: ["PDF", "PDF"],
    outputs: ["Comparison"],
    engines: ["custom"],
    accent: "from-violet-500 via-purple-500 to-indigo-500"
  },
  {
    slug: "redact-pdf",
    title: "Redact PDF",
    summary: "Redact text and graphics to permanently remove sensitive information from a PDF.",
    category: "security",
    status: "coming-soon",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["custom"],
    accent: "from-slate-800 via-zinc-900 to-black"
  },
  {
    slug: "crop-pdf",
    title: "Crop PDF",
    summary: "Crop margins of PDF documents or select specific areas, then apply the changes to one page or the whole document.",
    category: "edit",
    status: "coming-soon",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["custom"],
    accent: "from-amber-400 via-yellow-500 to-orange-500"
  },
  {
    slug: "ai-summarizer",
    title: "AI Summarizer",
    summary: "Quickly generate concise summaries from articles, paragraphs, and essays, providing clear and precise key points in seconds.",
    category: "ai",
    status: "coming-soon",
    premium: false,
    accepts: ["PDF", "Text"],
    outputs: ["Summary"],
    engines: ["openai"],
    accent: "from-blue-600 via-violet-600 to-fuchsia-500"
  },
  {
    slug: "translate-pdf",
    title: "Translate PDF",
    summary: "Easily translate PDF files powered by AI. Keep fonts, layout, and formatting perfectly intact.",
    category: "ai",
    status: "coming-soon",
    premium: false,
    accepts: ["PDF"],
    outputs: ["PDF"],
    engines: ["openai", "custom"],
    accent: "from-sky-500 via-blue-600 to-violet-600"
  },
  {
    slug: "workflow-builder",
    title: "Create a workflow",
    summary: "Create custom workflows with your favorite tools, automate tasks, and reuse them anytime.",
    category: "workflow",
    status: "coming-soon",
    premium: false,
    accepts: ["Multiple inputs"],
    outputs: ["Workflow"],
    engines: ["custom"],
    accent: "from-rose-500 via-pink-500 to-fuchsia-500"
  },
  {
    slug: "jpg-to-pdf",
    title: "JPG to PDF",
    summary: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    category: "convert to pdf",
    status: "available",
    premium: false,
    accepts: ["JPG", "PNG"],
    outputs: ["PDF"],
    engines: ["img2pdf"],
    accent: "from-fuchsia-500 via-signal to-orange-400"
  },
  {
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    summary: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
    category: "convert from pdf",
    status: "available",
    premium: false,
    accepts: ["PDF"],
    outputs: ["JPG"],
    engines: ["mutool", "sharp"],
    accent: "from-sky-500 via-indigo-500 to-signal"
  }
];

export const toolDefinitions = tools;
