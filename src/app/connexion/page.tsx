import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, MapPin, ShieldCheck, Sparkles, Store } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace FasoLink et retrouvez vos boutiques favorites.",
};

export default function ConnexionPage() {
  return (
    <div className="auth-page-shell">
      <div className="auth-page-glow auth-page-glow-one" aria-hidden="true" />
      <div className="auth-page-glow auth-page-glow-two" aria-hidden="true" />
      <div className="container-faso relative py-9 sm:py-14 lg:py-20">
        <div className="auth-page-grid">
          <section className="auth-story" aria-labelledby="auth-story-title">
            <span className="section-kicker"><Sparkles className="h-3.5 w-3.5" /> La communauté FasoLink</span>
            <h1 id="auth-story-title" className="auth-display-title">Le local vous attend.<br /><span>Reprenez le fil.</span></h1>
            <p className="auth-story-copy">Retrouvez vos boutiques favorites, explorez les talents près de vous et gardez vos échanges à portée de main.</p>

            <div className="auth-visual" aria-label="Aperçu de votre espace FasoLink">
              <div className="auth-visual-orbit auth-visual-orbit-a" />
              <div className="auth-visual-orbit auth-visual-orbit-b" />
              <div className="auth-visual-card auth-visual-main">
                <span className="auth-visual-mark"><Store aria-hidden="true" /></span>
                <div className="mt-5 flex items-center justify-between gap-4"><div><p className="text-xs font-bold text-white/55">VOTRE QUOTIDIEN LOCAL</p><p className="mt-1 text-lg font-bold text-white">Tout près. Tout Faso.</p></div><span className="auth-visual-spark"><Sparkles aria-hidden="true" /></span></div>
                <div className="auth-visual-lines"><i /><i /><i /></div>
              </div>
              <div className="auth-visual-card auth-visual-float auth-visual-favorite"><span><Heart aria-hidden="true" /></span><div><b>Vos favoris</b><small>À retrouver ici</small></div><span className="auth-favorite-dot" /></div>
              <div className="auth-visual-card auth-visual-float auth-visual-near"><MapPin aria-hidden="true" /><span>Les bonnes adresses, autour de vous.</span></div>
              <div className="auth-visual-star" aria-hidden="true">✳</div>
            </div>

            <div className="auth-trust-row"><span><ShieldCheck aria-hidden="true" /> Connexion protégée</span><span className="auth-trust-separator" /><span>Burkina Faso <span aria-hidden="true">🇧🇫</span></span></div>
          </section>

          <div className="auth-form-column"><AuthForm initialMode="login" /></div>
        </div>
        <div className="auth-bottom-note"><span>Première visite sur FasoLink ?</span><Link href="/inscription">Créer votre compte gratuitement <ArrowRight aria-hidden="true" /></Link></div>
      </div>
    </div>
  );
}
