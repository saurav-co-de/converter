import type { ReactNode } from "react";
import { Badge } from "./badge";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl space-y-3">
        <Badge>{eyebrow}</Badge>
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
        <p className="text-base leading-7 text-slate-600 sm:text-lg">{description}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
