import { AppLink as Link } from "@/components/site/AppLink";
import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "outline" | "destructive";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-faso-red text-white shadow-premium hover:bg-faso-red-dark hover:shadow-premium-lg hover:-translate-y-0.5",
  secondary:
    "bg-faso-green text-white shadow-premium hover:bg-faso-green-dark hover:-translate-y-0.5",
  gold: "bg-faso-gold text-ink shadow-premium hover:bg-faso-gold-dark hover:text-white hover:-translate-y-0.5",
  outline:
    "border border-ink/15 bg-white/90 text-ink shadow-sm hover:border-faso-red hover:text-faso-red hover:shadow-premium",
  ghost: "text-ink hover:bg-clay-100",
  destructive:
    "bg-state-danger text-white shadow-premium hover:bg-faso-red-dark hover:shadow-premium-lg hover:-translate-y-0.5",
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
