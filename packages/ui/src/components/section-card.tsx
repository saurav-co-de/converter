import type { PropsWithChildren } from "react";

type SectionCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  copy: string;
}>;

export function SectionCard({
  eyebrow,
  title,
  copy,
  children
}: SectionCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-soft backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-tide">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-3xl text-ink">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{copy}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

type StatProps = {
  label: string;
  value: string;
};

export function Stat({ label, value }: StatProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-cloud p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
    </div>
  );
}
