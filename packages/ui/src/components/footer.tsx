import { Container } from "./container";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <a className="font-display text-2xl font-semibold text-ink" href="/">
            PDF<span className="text-signal">toJPG</span>
          </a>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Simple web service for converting the first page of a PDF into a JPG and downloading it right away.
          </p>
        </div>
        <p className="text-sm text-slate-500">No account required.</p>
      </Container>
    </footer>
  );
}
