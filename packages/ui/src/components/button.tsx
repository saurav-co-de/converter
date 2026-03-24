import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type SharedProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

const variants = {
  primary: "bg-signal text-white hover:bg-rose-700",
  secondary: "bg-ink text-white hover:bg-slate-700",
  ghost: "bg-white text-ink ring-1 ring-slate-300 hover:bg-slate-50"
};

const baseClass =
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal";

export function Button(props: ButtonProps | LinkProps) {
  const variant = props.variant ?? "primary";
  const className = `${baseClass} ${variants[variant]} ${props.className ?? ""}`.trim();

  if (typeof props.href === "string") {
    const { children, href, className: _ignored, variant: _variant, ...rest } = props as LinkProps;
    return (
      <a className={className} href={href} {...rest}>
        {children}
      </a>
    );
  }

  const { children, className: _ignored, variant: _variant, type = "button", ...rest } =
    props as ButtonProps;
  return (
    <button className={className} type={type} {...rest}>
      {children}
    </button>
  );
}
