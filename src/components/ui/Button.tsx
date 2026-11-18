import { AppLink as Link } from "@/components/site/AppLink";
import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "outline" | "destructive" | "ink";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "btn-shine bg-[linear-gradient(135deg,rgb(var(--faso-red))_0%,rgb(var(--faso-red-dark))_100%)] text-white shadow-[0_1px_0_rgb(255_255_255/.25)_inset,0_14px_34px_-16px_rgb(var(--faso-red)/.85)] hover:shadow-[0_1px_0_rgb(255_255_255/.25)_inset,0_20px_44px_-16px_rgb(var(--faso-red)/.9)] hover:-translate-y-0.5",
  secondary:
    "btn-shine bg-faso-green text-white shadow-premium hover:bg-faso-green-dark hover:-translate-y-0.5",
  gold: "btn-shine bg-[linear-gradient(135deg,#f8c46e_0%,rgb(var(--faso-gold))_55%,#e59a31_100%)] text-ink shadow-[0_1px_0_rgb(255_255_255/.45)_inset,0_14px_34px_-16px_rgb(var(--faso-gold)/.9)] hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgb(255_255_255/.45)_inset,0_20px_44px_-16px_rgb(var(--faso-gold)/.95)]",
  outline:
    "border border-ink/15 bg-white/90 text-ink shadow-sm backdrop-blur hover:border-ink/30 hover:bg-white hover:shadow-premium hover:-translate-y-0.5",
  ghost: "text-ink hover:bg-clay-100",
  destructive:
    "bg-state-danger text-white shadow-premium hover:bg-faso-red-dark hover:shadow-premium-lg hover:-translate-y-0.5",
  ink: "btn-shine bg-ink text-white shadow-[0_1px_0_rgb(255_255_255/.12)_inset,0_14px_34px_-18px_rgb(26_17_9/.8)] hover:-translate-y-0.5 hover:bg-[#2a1f15]",
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-11 px-6 text-sm",
  lg: "min-h-14 px-8 text-base",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export interface ButtonProps
  extends BaseProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, loading = false, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn("btn-base", variants[variant], sizes[size], className)}
      {...props}
      disabled={disabled || loading}
      aria-busy={loading || props["aria-busy"]}
    >
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export interface ButtonLinkProps
  extends BaseProps,
    Omit<React.ComponentProps<typeof Link>, "className"> {
  external?: boolean;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  external,
  ...props
}: ButtonLinkProps) {
  const classes = cn("btn-base", variants[variant], sizes[size], className);
  if (external) {
    return (
      <a
        className={classes}
        href={props.href as string}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.children}
      </a>
    );
  }
  return <Link className={classes} {...props} />;
}
