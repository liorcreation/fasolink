import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  // Les pages pré-générées sont lues directement depuis les assets Cloudflare.
  // Elles ne déclenchent donc pas un nouveau rendu SSR à chaque visite.
  // Les pages qui doivent rester dynamiques sont explicitement rendues à la demande.
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
  routePreloadingBehavior: "none",
});
