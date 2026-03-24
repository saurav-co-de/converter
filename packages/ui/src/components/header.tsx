import { Container } from "./container";

export function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/90">
      <Container className="flex h-20 items-center justify-between">
        <a className="font-display text-2xl font-semibold text-ink" href="/">
          PDF<span className="text-signal">toJPG</span>
        </a>
        <p className="text-sm text-slate-500">Upload PDF, download JPG</p>
      </Container>
    </header>
  );
}
