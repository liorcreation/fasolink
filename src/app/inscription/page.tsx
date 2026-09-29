import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Heart, MapPin, MessageCircle, ShieldCheck, Sparkles, Store } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez gratuitement votre compte acheteur FasoLink et découvrez les commerces du Burkina Faso.",
};

const benefits = [
  { icon: Heart, title: "Gardez vos coups de cœur", copy: "Retrouvez en un clin d’œil les boutiques que vous aimez." },
  { icon: MapPin, title: "Découvrez près de vous", copy: "Explorez les commerces et savoir-faire du Burkina." },
  { icon: MessageCircle, title: "Échangez directement", copy: "Contactez les vendeurs via leurs moyens de contact." },
];

export default function InscriptionPage() {
  return (
    <div className="auth-page-shell auth-signup-shell">
      <div className="auth-page-glow auth-page-glow-one" aria-hidden="true" />
      <div className="auth-page-glow auth-page-glow-two" aria-hidden="true" />
      <div className="container-faso relative py-9 sm:py-14 lg:py-20">
        <div className="auth-page-grid">
          <section className="auth-story" aria-labelledby="signup-story-title">
            <span className="section-kicker"><Sparkles className="h-3.5 w-3.5" /> L’aventure commence ici</span>
            <h1 id="signup-story-title" className="auth-display-title">Votre prochain<br /><span>coup de cœur</span><br />est tout près.</h1>
            <p className="auth-story-copy">Un compte gratuit pour découvrir, enregistrer et soutenir les commerces qui font vibrer le Burkina Faso.</p>

            <div className="auth-benefit-list">
              {benefits.map(({ icon: Icon, title, copy }, index) => (
                <div className="auth-benefit" key={title}>
                  <span className={`auth-benefit-icon auth-benefit-icon-${index}`}><Icon aria-hidden="true" /></span>
                  <span><b>{title}</b><small>{copy}</small></span>
                  <Check className="auth-benefit-check" aria-hidden="true" />
                </div>
              ))}
            </div>

            <div className="auth-vendor-callout">
              <span className="auth-vendor-icon"><Store aria-hidden="true" /></span>
              <div><b>Vous êtes vendeur ou artisan ?</b><p>Créez votre boutique professionnelle sur FasoLink.</p><Link href="/vendeur/inscription">Ouvrir ma boutique <ArrowRight aria-hidden="true" /></Link></div>
            </div>
            <div className="auth-trust-row"><span><ShieldCheck aria-hidden="true" /> Compte acheteur gratuit</span><span className="auth-trust-separator" /><span>Sans engagement</span></div>
          </section>

          <div className="auth-form-column"><AuthForm initialMode="signup" /></div>
        </div>
        <div className="auth-bottom-note"><span>Vous avez déjà un compte ?</span><Link href="/connexion">Se connecter <ArrowRight aria-hidden="true" /></Link></div>
      </div>
    </div>
  );
}
