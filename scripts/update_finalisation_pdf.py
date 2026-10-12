from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "fasolink-dossier-finalisation-commercialisation.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

regular = r"C:\Windows\Fonts\segoeui.ttf"
bold = r"C:\Windows\Fonts\segoeuib.ttf"
if Path(regular).exists() and Path(bold).exists():
    pdfmetrics.registerFont(TTFont("Faso", regular))
    pdfmetrics.registerFont(TTFont("Faso-Bold", bold))
    FONT, BOLD = "Faso", "Faso-Bold"
else:
    FONT, BOLD = "Helvetica", "Helvetica-Bold"

INK = colors.HexColor("#17120E")
MUTED = colors.HexColor("#655A50")
SAND = colors.HexColor("#FBF6EF")
CLAY = colors.HexColor("#EDE3D6")
RED = colors.HexColor("#D62828")
GREEN = colors.HexColor("#1F9254")
GOLD = colors.HexColor("#F4A93C")
NAVY = colors.HexColor("#161A24")
WHITE = colors.white

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Kicker", fontName=BOLD, fontSize=8, leading=11, textColor=GOLD, spaceAfter=7))
styles.add(ParagraphStyle(name="CoverTitle2", fontName=BOLD, fontSize=28, leading=33, textColor=WHITE, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverText", fontName=FONT, fontSize=11, leading=16, textColor=colors.HexColor("#E8DED2"), spaceAfter=10))
styles.add(ParagraphStyle(name="H1x", fontName=BOLD, fontSize=21, leading=26, textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle(name="H2x", fontName=BOLD, fontSize=12, leading=16, textColor=INK, spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle(name="Bodyx", fontName=FONT, fontSize=8.6, leading=12.4, textColor=MUTED, spaceAfter=5))
styles.add(ParagraphStyle(name="Smallx", fontName=FONT, fontSize=7.1, leading=9.4, textColor=INK))
styles.add(ParagraphStyle(name="SmallBoldx", fontName=BOLD, fontSize=7.1, leading=9.4, textColor=INK))
styles.add(ParagraphStyle(name="TableHeadx", fontName=BOLD, fontSize=7.4, leading=9.3, textColor=WHITE))
styles.add(ParagraphStyle(name="Calloutx", fontName=FONT, fontSize=8.8, leading=12.7, textColor=INK))

def P(text, style="Bodyx"):
    return Paragraph(text, styles[style])

def table(rows, widths):
    cells = []
    for ri, row in enumerate(rows):
        cells.append([cell if isinstance(cell, Paragraph) else P(str(cell), "TableHeadx" if ri == 0 else "Smallx") for cell in row])
    t = Table(cells, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("GRID", (0, 0), (-1, -1), .35, CLAY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7), ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        *[("BACKGROUND", (0, ri), (-1, ri), colors.HexColor("#FFFDFC")) for ri in range(1, len(rows)) if ri % 2 == 1],
    ]))
    return t

def header(title, subtitle):
    return [P("DOSSIER DE LIVRAISON - MISE A JOUR 12 OCTOBRE 2026", "Kicker"), P(title, "H1x"), P(subtitle), Spacer(1, 3 * mm)]

def page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(SAND)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setStrokeColor(CLAY)
    canvas.line(18 * mm, 16 * mm, A4[0] - 18 * mm, 16 * mm)
    canvas.setFont(FONT, 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, "FasoLink | Dossier de finalisation commerciale")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"{doc.page:02d}")
    canvas.restoreState()

def cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setFillColor(RED)
    canvas.circle(A4[0] - 10 * mm, A4[1] - 14 * mm, 42 * mm, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.circle(10 * mm, 20 * mm, 28 * mm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont(BOLD, 10)
    canvas.drawString(18 * mm, A4[1] - 28 * mm, "FASOLINK")
    canvas.setFillColor(colors.HexColor("#D8D0C8"))
    canvas.setFont(FONT, 7)
    canvas.drawRightString(A4[0] - 18 * mm, A4[1] - 28 * mm, "CONFIDENTIEL - PREPARATION DE LIVRAISON")
    canvas.drawString(18 * mm, 12 * mm, "Version actualisee | 12 octobre 2026")
    canvas.restoreState()

class Doc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=22*mm)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        self.addPageTemplates([PageTemplate(id="cover", frames=frame, onPage=cover), PageTemplate(id="content", frames=frame, onPage=page)])

def story():
    s = [Spacer(1, 48*mm), P("DOSSIER DE FINALISATION COMMERCIALE", "Kicker"), P("FasoLink", "CoverTitle2"), P("Etat des travaux, securite, paiement CinetPay et actions avant lancement", "CoverText"), Spacer(1, 20*mm), P("Marketplace de produits electroniques au Burkina Faso", "CoverText"), Spacer(1, 24*mm), P("DECISION A RETENIR", "Kicker"), P("Next.js 16.3.8 et OpenNext sont prepares; le build, le bundle Workers et le preview local repondent sur les routes testees. Une recette de production et les parametres marchands restent a faire avant la bascule. Aucun paiement n'a ete effectue.", "CoverText"), PageBreak()]

    s += header("1. Synthese de l'etape", "Le choix de passerelle retenu est CinetPay, a la demande du proprietaire du projet.")
    s += [table([
        ["Domaine", "Etat verifie", "Conclusion"],
        ["Paiement", "Checkout CinetPay heberge; montant et forfait verifies sur le serveur; aucune collecte de PIN.", "Code integre, secrets manquants"],
        ["Confirmation", "Le serveur consulte l'API CinetPay avant activation; abonnement et boutique changent ensemble.", "A tester avec le compte marchand"],
        ["Essai gratuit", "14 jours; attribution serveur; un essai par boutique; ecriture atomique.", "Code integre"],
        ["Acces catalogue", "Boutiques actives et produits associes publics; boutique suspendue masquee.", "Regles Firestore publiees"],
        ["Roles", "Creation boutique en attente; abonnement payant non creatable par le navigateur; fichiers prives reserves au proprietaire/Super Admin.", "Firestore publie; Storage a activer"],
        ["Qualite", "Next 16.3.8, bundle OpenNext et preview local passes; lint sans erreur; audit production: 0.", "Worker de preproduction publie; paiement marchand requis"],
    ], [28*mm, 103*mm, 39*mm]), Spacer(1, 7*mm), P("Environnement", "H2x"), P("Worker de preproduction publie sur fasolink.jurisia-api.workers.dev; fasolink.pages.dev reste inchange. Les regles Firestore sont publiees, mais Firebase Storage n'est pas initialise. Les secrets Cloudflare CinetPay/Firebase ne sont pas configures."), P("Decision", "H2x"), P("FasoLink ne doit pas encore etre declare pret a encaisser en production. Les identifiants CinetPay, les secrets Cloudflare, l'activation de Storage et un test marchand controle sont indispensables.", "Calloutx"), PageBreak()]

    s += header("2. Ce qui a ete implemente", "Le parcours de paiement n'utilise plus de simulation ni d'ecran de saisie PIN.")
    s += [table([
        ["Bloc", "Changement"],
        ["CinetPay", "Initialisation serveur avec formule/prix issus du code; compte Firebase verifie; proprietaire de la boutique confirme; transaction XOF unique; redirection vers checkout CinetPay."],
        ["Webhook", "Notification et retour ne suffisent pas a prouver le paiement. Le serveur appelle la verification officielle CinetPay, compare reference, montant et devise, puis effectue une transaction Firestore atomique."],
        ["Anti-contournement", "Le vendeur ne peut plus creer ou modifier son abonnement payant depuis le client Firestore."],
        ["Essai", "Essai gratuit calcule et enregistre cote serveur; impossible de le rejouer pour une boutique deja licenciee."],
        ["Firestore", "Lecture publique limitee aux boutiques actives et produits de leur boutique; shop_id d'un produit inchangeable par le vendeur."],
        ["Storage", "Claim historique admin retire des pieces de verification privees; claim superAdmin requis pour l'administration."],
        ["Socle", "Next.js 16.3.8, React 19, Firebase 13, Firebase Admin 13 et OpenNext Cloudflare 1.20.10; runtimes Edge retires."],
    ], [32*mm, 138*mm]), Spacer(1, 5*mm), P("Tests effectues", "H2x"), P("- npm run lint : OK<br/>- npm run build Next.js 16.3.8 : OK; TypeScript : OK<br/>- Preview OpenNext Workers : HTTP 200 sur les pages principales, 404 sur une route inconnue, 405 attendu pour l'endpoint de paiement appele en GET<br/>- Next.js 16.4 causait une erreur preview-props; version ramenee a 16.3.8, compatible avec OpenNext 1.20.10<br/>- npm audit --omit=dev : 0 vulnerabilite de production; l'audit complet signale encore des outils build/dev<br/>Aucun paiement n'a ete declenche et aucun debit reel n'a ete effectue."), PageBreak()]

    s += header("3. Points bloquants pour le lancement", "Actions a realiser avant de basculer la production vers l'encaissement.")
    s += [table([
        ["Priorite", "Action", "Responsable"],
        ["P0", "Creer/valider le compte marchand CinetPay FasoLink et activer les canaux burkinabe autorises (Orange Money, Moov Money selon l'eligibilite).", "Client"],
        ["P0", "Valider le preview OpenNext en CI Linux avant bascule du domaine; le preview local Windows passe maintenant les tests des routes principales.", "Technique"],
        ["P0", "Confirmer l'URL finale. Le Worker de test est sur fasolink.jurisia-api.workers.dev; fasolink.pages.dev reste inchange. Adapter Firebase Auth et CinetPay a l'URL retenue.", "Client + technique"],
        ["P0", "Reconsulter l'avis officiel Next.js apres le 14 octobre 2026 et appliquer les correctifs pertinents avant ouverture.", "Technique"],
        ["P0", "Configurer dans Cloudflare les secrets CINETPAY_API_KEY, CINETPAY_SITE_ID, FIREBASE_SERVICE_ACCOUNT et les variables APP_BASE_URL, CRON_SECRET.", "Client + technique"],
        ["P0", "Regles Firestore deja publiees. Activer Storage, puis publier ses regles et tester les acces prive/public.", "Technique + proprietaire Firebase"],
        ["P0", "Activer Firebase Storage et verifier les couts du forfait Blaze, alertes et quotas avant d'y stocker des fichiers.", "Client"],
        ["P0", "Worker de preproduction deja publie; recetter pages, auth, PWA et APIs avant toute bascule de Pages vers Workers.", "Technique"],
        ["P0", "Recette CinetPay acceptee/refusee/annulee, notification doublee, retour navigateur, montant incorrect, boutique suspendue.", "Client + technique"],
        ["P1", "Configurer le rate limit Cloudflare pour initialisation paiement, verification et cron; verifier les quotas et la supervision.", "Technique"],
        ["P1", "Completer les informations legales officielles et faire relire les textes par le client/conseil juridique.", "Client"],
        ["P1", "Remplacer et controler les donnees de demonstration, boutiques, produits, photos, prix, support et coordonnees.", "Client"],
    ], [18*mm, 120*mm, 32*mm]), Spacer(1, 5*mm), P("Secrets", "H2x"), P("Ne pas envoyer les cles API, JSON de compte de service ou secrets par WhatsApp, email non securise ou capture. Les saisir directement dans les secrets de production Cloudflare, puis verifier qu'ils ne sont pas exposes dans le bundle navigateur."), PageBreak()]

    s += header("4. Budget et dependances financieres", "Aucun montant de frais fournisseur n'est invente dans ce dossier.")
    s += [table([
        ["Poste", "Nature du cout", "A confirmer"],
        ["CinetPay", "Frais par transaction, delai de reversement, limites et remboursements selon contrat marchand.", "Tarif du compte"],
        ["Firebase Storage", "Forfait Blaze potentiellement requis; stockage, telechargements et reseau selon consommation.", "Budget, alertes, quotas"],
        ["Cloudflare", "Workers: quotas, volume de requetes et options de controle selon le compte et le domaine choisi.", "Plan du compte"],
        ["Nom de domaine", "Achat et renouvellement si domaine personnalise demande.", "Registrar et prix annuel"],
        ["Conformite", "Conseil/relecture juridique et traitement des politiques donnees/remboursements.", "Prestataire choisi"],
        ["Maintenance", "Surveillance, mises a jour, assistance vendeurs, incident paiement et evolutions.", "Contrat separe"],
    ], [34*mm, 101*mm, 35*mm]), Spacer(1, 8*mm), P("Ce qui n'est pas facture par cette etape", "H2x"), P("Le developpement et les tests techniques prepares ici n'ont pas declenche de paiement fournisseur. Les tarifs exacts CinetPay et Firebase ne peuvent etre confirmes qu'a partir des comptes et contrats du client."), P("Estimation prudente", "H2x"), P("Prevoir une enveloppe d'exploitation distincte du prix de conception : frais de transactions, stockage/traffic, domaine et maintenance. Demander les tarifs ecrits avant activation commerciale.", "Calloutx"), PageBreak()]

    s += header("5. Plan de cloture et reception", "Etapes dans l'ordre recommande pour remettre FasoLink sereinement.")
    s += [table([
        ["Etape", "Critere de cloture"],
        ["1. CinetPay", "Compte marchand valide; cles saisies dans Cloudflare; transaction faible valeur acceptee puis remboursee/rapprochee selon accord."],
        ["2. Firebase", "Storage active, regles publiees; essai vendeur, photo publique et dossier prive testes avec comptes distincts."],
        ["3. Roles", "Vendeur ne peut pas modifier statut, abonnement ou verification; ancien admin ne lit pas les documents prives; Super Admin autorise."],
        ["4. Paiement", "Acceptation active exactement une fois; refus/annulation n'activent rien; montant invalide rejete; boutique suspendue non reactivee."],
        ["5. Exploitation", "Cron teste; alertes et rate limiting configures; procedure remboursement, support et rapprochement connue."],
        ["6. Contenus", "Coordonnees legales, support, prix, boutiques et produits valides par le client."],
        ["7. Livraison", "Commit/version production, deployment, PV de recette, documentation et acces transmis par canal securise."],
    ], [31*mm, 139*mm]), Spacer(1, 7*mm), P("Conclusion", "H2x"), P("Le Worker de preproduction est en ligne sur fasolink.jurisia-api.workers.dev et les regles Firestore sont publiees. L'ancien site fasolink.pages.dev n'a pas ete remplace. Avant la commercialisation: configurer les secrets Cloudflare, activer Firebase Storage et publier ses regles, choisir/confirmer l'URL finale, puis effectuer la recette de paiement CinetPay. Aucun paiement reel n'a ete execute.", "Calloutx"), Spacer(1, 8*mm), P("Validation de reception", "H2x"), table([["Pour FasoLink", "Pour le client"], ["Nom : ___________________________<br/><br/>Date : ___________________________<br/><br/>Signature : _______________________", "Nom : ___________________________<br/><br/>Date : ___________________________<br/><br/>Signature : _______________________"]], [85*mm, 85*mm])]
    return s

if __name__ == "__main__":
    doc = Doc(str(OUT))
    doc.title = "FasoLink - Dossier de finalisation commerciale - 12 octobre 2026"
    doc.author = "FasoLink"
    doc.handle_nextPageTemplate("content")
    doc.build(story())
    print(OUT)
