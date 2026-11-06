"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

/**
 * FasoLink avoids background route rendering on Cloudflare Workers.
 * Pages are still navigated client-side when the visitor selects a link.
 */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>((props, ref) => (
  <Link {...props} ref={ref} prefetch={false} />
));
AppLink.displayName = "AppLink";
