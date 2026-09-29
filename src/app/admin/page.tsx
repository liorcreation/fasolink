import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Super Admin",
  description: "Centre de contrôle FasoLink : licences, boutiques et vérifications.",
};

export default function AdminPage() {
  return (
    <div className="container-faso py-12 md:py-16">
      <PageHeader
        align="left"
        eyebrow="FasoLink · Super Admin"
        title="Centre de contrôle"
        description="Gérez les licences, les boutiques, les vérifications et la confiance sur toute la marketplace."
        icon="shield"
      />
      <div className="mt-10"><AdminDashboard /></div>
    </div>
  );
}
