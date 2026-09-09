import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-faso-red text-white shadow-premium hover:bg-faso-red-dark hover:shadow-premium-lg hover:-translate-y-0.5",
  secondary:
    "bg-faso-green text-white shadow-premium hover:bg-faso-green-dark hover:-translate-y-0.5",
  gold: "bg-faso-gold text-ink shadow-premium hover:bg-faso-gold-dark hover:text-white hover:-translate-y-0.5",
  outline:
    "border-2 border-ink/15 bg-white text-ink hover:border-faso-red hover:text-faso-red",
  ghost: "text-ink hover:bg-clay-100",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export interface ButtonProps
  extends BaseProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn("btn-base", variants[variant], sizes[size], className)}
      {...props}
    />
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
