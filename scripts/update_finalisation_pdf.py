from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "fasolink-dossier-finalisation-commercialisation.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

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
styles.add(ParagraphStyle(name="KickerX", fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=GOLD, spaceAfter=7))
styles.add(ParagraphStyle(name="CoverTitleX", fontName="Helvetica-Bold", fontSize=29, leading=34, textColor=WHITE, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverTextX", fontName="Helvetica", fontSize=10, leading=15, textColor=colors.HexColor("#E8DED2"), spaceAfter=8))
styles.add(ParagraphStyle(name="H1X", fontName="Helvetica-Bold", fontSize=20, leading=25, textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle(name="H2X", fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=INK, spaceBefore=7, spaceAfter=4))
styles.add(ParagraphStyle(name="BodyX", fontName="Helvetica", fontSize=8.2, leading=11.5, textColor=MUTED, spaceAfter=5))
styles.add(ParagraphStyle(name="SmallX", fontName="Helvetica", fontSize=7, leading=9.2, textColor=INK))
styles.add(ParagraphStyle(name="HeadX", fontName="Helvetica-Bold", fontSize=7, leading=9, textColor=WHITE))
styles.add(ParagraphStyle(name="CalloutX", fontName="Helvetica-Bold", fontSize=8.2, leading=11.4, textColor=INK))

def p(text, style="BodyX"):
    return Paragraph(text, styles[style])

def table(rows, widths):
    data = [[cell if isinstance(cell, Paragraph) else p(str(cell), "HeadX" if i == 0 else "SmallX") for cell in row] for i, row in enumerate(rows)]
    result = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    result.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("GRID", (0, 0), (-1, -1), .35, CLAY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        *[("BACKGROUND", (0, i), (-1, i), colors.HexColor("#FFFDFC")) for i in range(1, len(rows)) if i % 2],
    ]))
    return result

def header(title, subtitle):
    return [p("DOSSIER DE LIVRAISON • MISE À JOUR 6 NOVEMBRE 2026", "KickerX"), p(title, "H1X"), p(subtitle), Spacer(1, 2*mm)]

def draw_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(SAND); canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setStrokeColor(CLAY); canvas.line(18*mm, 16*mm, A4[0]-18*mm, 16*mm)
    canvas.setFont("Helvetica", 7); canvas.setFillColor(MUTED)
    canvas.drawString(18*mm, 10*mm, "FasoLink | Finalisation et préparation commerciale")
    canvas.drawRightString(A4[0]-18*mm, 10*mm, f"{doc.page:02d}")
    canvas.restoreState()

def draw_cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY); canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setFillColor(RED); canvas.circle(A4[0]-10*mm, A4[1]-14*mm, 42*mm, fill=1, stroke=0)
    canvas.setFillColor(GOLD); canvas.circle(10*mm, 20*mm, 28*mm, fill=1, stroke=0)
    canvas.setFillColor(WHITE); canvas.setFont("Helvetica-Bold", 10); canvas.drawString(18*mm, A4[1]-28*mm, "FASOLINK")
    canvas.setFillColor(colors.HexColor("#D8D0C8")); canvas.setFont("Helvetica", 7)
    canvas.drawRightString(A4[0]-18*mm, A4[1]-28*mm, "CONFIDENTIEL • PRÉPARATION DE LIVRAISON")
    canvas.drawString(18*mm, 12*mm, "Version actualisée | 6 novembre 2026")
    canvas.restoreState()

class Doc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=22*mm)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        self.addPageTemplates([PageTemplate(id="cover", frames=frame, onPage=draw_cover), PageTemplate(id="body", frames=frame, onPage=draw_page)])

def story():
    s = [Spacer(1, 48*mm), p("DOSSIER DE FINALISATION COMMERCIALE", "KickerX"), p("FasoLink", "CoverTitleX"),
         p("État des travaux, sécurité, exploitation et actions avant livraison", "CoverTextX"), Spacer(1, 20*mm),
         p("Marketplace de produits électroniques au Burkina Faso", "CoverTextX"), Spacer(1, 24*mm),
         p("DÉCISION À RETENIR", "KickerX"),
         p("Les pages publiques répondent, mais le dernier build Pages de main et les tests CI Firebase sont en échec. La livraison commerciale complète n'est pas prête : les comptes, les règles, le paiement, les textes légaux et les données de production doivent être validés.", "CoverTextX"), PageBreak()]

    s += header("1. Situation actuelle", "Ce qui est en place, ce qui est vérifié et ce qui reste à prouver.")
    s += [table([
        ["Domaine", "État du code / de la démonstration", "État de clôture"],
        ["Application", "Worker version e2a31582-21e1-430f-ae83-ecfdc6c58939 sur le commit bf593d0; / et /offline HTTP 200, route inconnue HTTP 404. Pages reste une publication distincte." , "Versions différentes"],
        ["Build Pages", "Le dernier résultat consulté pour Pages concernait le commit 3328929 et était Failure. Le résultat du push plus récent 8232cb6 n'a pas encore été vérifié dans Pages.", "Pipeline à réparer ou Pages à abandonner"],
        ["Règles", "Workflow Firebase 41238891242 échoué dans l'étape de tests; logs détaillés non accessibles.", "Règles non validées par tests"],
        ["Paiement", "Aucun secret sur le Worker applicatif; pas de clé CinetPay ni compte service configuré.", "Pas de transaction réelle testée"],
        ["Cron", "Secret présent sur le Worker cron, absent côté API; POST sans authentification renvoie 401.", "Expiration automatique bloquée"],
        ["Photos et documents", "Règles Storage présentes; activation actuelle du bucket à confirmer.", "État et coût à vérifier"],
        ["Textes légaux", "Identité éditeur, adresse, email et responsable de publication à compléter.", "À faire avant ouverture"],
        ["Protection trafic", "Limiteur en mémoire, local à chaque isolate; Firebase Auth direct n'y passe pas.", "Protection globale à configurer"],
    ], [27*mm, 90*mm, 53*mm]), Spacer(1, 5*mm), p("Contrôles techniques", "H2X"),
        p("ESLint, TypeScript et le build de production ont réussi le 6 novembre. Après déploiement du commit bf593d0, / et /offline renvoient HTTP 200, et une route inconnue HTTP 404 sur le Worker. Le comportement hors connexion n'a pas été simulé dans un navigateur déconnecté; les écrans d'erreur ont été compilés mais pas déclenchés artificiellement en production. Le contrôle HTTP ne valide pas les parcours connectés ni les écritures Firebase. Le test local Firestore/Storage s'est arrêté faute de Java 21; le workflow GitHub a ensuite échoué dans son étape de test. Les journaux détaillés nécessitent un droit administrateur du dépôt."),
        p("Conclusion", "H2X"),
        p("FasoLink peut être montré comme démonstration. Ne pas encore annoncer une mise en production commerciale prête à encaisser ni une sécurité certifiée.", "CalloutX"), PageBreak()]

    s += header("2. Ce qui peut être fait côté technique", "Travaux réalisables dans le dépôt, sans accès aux comptes ni paiement fournisseur.")
    s += [table([
        ["Action technique", "Avancement / résultat"],
        ["Tests Firebase", "Workflow ajouté; premier run échoué dans l'étape de tests. Cause à lire dans les journaux protégés par les droits du dépôt."],
        ["Documentation de sécurité", "Les limites réelles du rate limiter et les vérifications encore manquantes sont décrites sans prétendre à une certification."],
        ["Configuration sûre", "Exemples de configuration corrigés : URL locale en développement, secret cron vide par défaut, pas de domaine client supposé."],
        ["Worker cron", "Le dernier déploiement observé date du 14 septembre; il ne contient pas la cible modifiée depuis. Le POST API reçoit 401 sans secret côté application."],
        ["Données de démonstration", "Le script npm run seed injecte 9 boutiques toutes catégories, avec abonnements factices actifs. À ne pas lancer sur la base de production."],
        ["Pages Cloudflare", "Le dernier build observé sur le commit 3328929 était en échec. Le résultat Pages après les pushs 5ea6748, dff3acc, c8fbd80 et 8232cb6 n'a pas été consulté; la synchronisation reste à vérifier."],
        ["Révision UI", "Palette et surfaces centralisées, Geist avec Sora, focus clavier, boutons à états, badges sémantiques. Catalogue : filtres tactiles, annonces accessibles et mouvements réduits. Connexion/Inscription : critères accessibles et chargement annoncé. Espace vendeur : placeholders et commandes tactiles. Profil : favoris avec états accessibles. Vitrine : avis tactiles et galerie au clavier. Fiche produit : retour Boutiques et contact contextualisé. Mes boutiques : filtres et synchronisation directe des vitrines, produits et licences. Inscription boutique : libellés explicites, progression accessible, photos JPG/PNG/WebP de moins de 5 Mo contrôlées avant envoi, limites de texte et mouvement réduit. Vérification : statuts en direct, reprise en cas d’erreur et justificatifs contrôlés. Pages hors connexion/404 : reprise au retour du réseau. Shell global : skeleton de chargement et secours pour erreurs de page/layout avec actions de reprise."],
        ["Dossier client", "PDF de livraison actualisé avec les versions différentes, les tests réellement lancés, les coûts à confirmer et les étapes de recette."],
    ], [43*mm, 127*mm]), Spacer(1, 7*mm), p("Actions nécessitant les comptes du client", "H2X"),
        p("Le choix de l'adresse officielle, l'attribution du rôle Super Admin, les clés CinetPay/Firebase, l'activation de Storage et l'approbation d'un éventuel budget ne peuvent pas être inventés ou remplacés par du code local. Ces opérations doivent être faites par une personne autorisée dans les comptes correspondants."),
        p("Secrets : règle de sécurité", "H2X"),
        p("Ne jamais envoyer une clé API, une clé privée Firebase ou un secret cron dans WhatsApp, une capture ou ce PDF. Les saisir directement dans Cloudflare/Firebase par un opérateur autorisé.", "CalloutX"), PageBreak()]

    s += header("3. Blocages avant commercialisation", "Ordre conseillé pour éviter une mise en production incomplète.")
    s += [table([
        ["Priorité", "Action", "Qui"],
        ["P0", "Choisir l'adresse officielle : Worker actuel ou domaine du client; Pages et Worker n'ont pas la même version.", "Client"],
        ["P0", "Obtenir les logs du run Firebase en échec, corriger et relancer les tests; comparer ensuite les règles actives au dépôt.", "Technique"],
        ["P0", "Réparer le build Pages si cette adresse est choisie; sinon confirmer le Worker comme domaine canonique et traiter Pages comme ancienne version.", "Client + technique"],
        ["P0", "Finaliser mentions légales, éditeur, adresse, contact et relecture de la confidentialité.", "Client"],
        ["P0", "Vérifier/activer Storage après accord sur le budget, publier ses règles et tester photos publiques et justificatifs privés.", "Client + technique"],
        ["P0", "Ajouter les secrets nécessaires dans Cloudflare et vérifier qu'ils ne sont pas exposés au navigateur.", "Client + technique"],
        ["P0", "Tester les rôles visiteur, vendeur et Super Admin avec des comptes séparés, autorisations et refus compris.", "Client + technique"],
        ["P0", "Faire une recette CinetPay : paiement accepté/refusé/annulé, notification répétée, montant invalide et boutique suspendue.", "Client + technique"],
        ["P0", "Mettre le même CRON_SECRET côté API et cron, redéployer le cron depuis sa configuration à jour, puis tester une expiration.", "Client + technique"],
        ["P1", "Désactiver le seeding démo en production et vérifier/supprimer les données de démonstration dans Firestore.", "Technique + client"],
        ["P1", "Configurer une protection Cloudflare adaptée aux requêtes exposées; le compteur mémoire actuel n'est pas global.", "Compte Cloudflare"],
        ["P1", "Faire la recette sur vrais téléphones, tablettes et ordinateurs, puis valider les textes, contenus et contacts de support.", "Client + technique"],
    ], [17*mm, 121*mm, 32*mm]), Spacer(1, 6*mm),
        p("Contrôle des coûts", "H2X"),
        p("Les postes possibles sont : frais de transaction CinetPay, stockage et trafic Firebase, options Cloudflare, nom de domaine éventuel, maintenance et relecture juridique. Le montant exact dépend des comptes et du contrat du client; aucun tarif fournisseur n'est inventé ici."), PageBreak()]

    s += header("4. Budget d'exploitation et réception", "Distinguer les dépenses fournisseur du prix de conception et de maintenance.")
    s += [table([
        ["Poste", "Ce qui peut être facturé", "À confirmer"],
        ["CinetPay", "Commission par transaction, délais et conditions de remboursement.", "Contrat marchand"],
        ["Firebase Storage", "Stockage, téléchargements et bande passante selon consommation.", "Forfait, budget et alertes"],
        ["Cloudflare", "Workers, trafic et protections supplémentaires selon le plan.", "Compte et limites"],
        ["Domaine", "Achat/renouvellement si le client choisit un domaine personnalisé.", "Nom et prix annuel"],
        ["Maintenance", "Mises à jour, surveillance, assistance et corrections convenues.", "Contrat séparé"],
        ["Juridique", "Relecture des conditions, confidentialité et obligations locales.", "Prestataire choisi"],
    ], [30*mm, 91*mm, 49*mm]), Spacer(1, 7*mm), p("Critères de réception", "H2X"),
        p("1. Le client confirme l'adresse et les contenus.<br/>2. Les tests Firebase passent et les règles actives sont comparées au dépôt.<br/>3. Le Super Admin, le vendeur et le visiteur ont les accès attendus.<br/>4. Photos et documents fonctionnent avec les bonnes permissions.<br/>5. Le paiement et le cron ont été testés avec les secrets réels.<br/>6. Les contrôles mobiles, tablettes et desktop sont terminés.<br/>7. Le procès-verbal, les contacts de support et les accès sont remis de manière sécurisée."),
        p("Décision de livraison", "H2X"),
        p("Démonstration en ligne : oui. Livraison commerciale : pas encore. Le build Pages et le workflow des règles Firebase sont en échec; paiement, cron, Storage, textes légaux, données de production et tests sur appareils restent à clôturer. La liste de blocages ne se limite donc pas à huit éléments.", "CalloutX"), Spacer(1, 7*mm),
        table([["Pour FasoLink", "Pour le client"], ["Nom : ___________________________<br/><br/>Date : ___________________________<br/><br/>Signature : _______________________", "Nom : ___________________________<br/><br/>Date : ___________________________<br/><br/>Signature : _______________________" ]], [85*mm, 85*mm])]
    return s

if __name__ == "__main__":
    doc = Doc(str(OUT))
    doc.title = "FasoLink - Dossier de finalisation commerciale - 6 novembre 2026"
    doc.author = "FasoLink"
    doc.handle_nextPageTemplate("body")
    doc.build(story())
    print(OUT)
