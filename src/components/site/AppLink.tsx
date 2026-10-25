"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

/**
 * FasoLink avoids background route rendering on Cloudflare Workers.
 * Pages are still navigated client-side when the visitor selects a link.
 */
export function AppLink(props: AppLinkProps) {
  return <Link {...props} prefetch={false} />;
}
