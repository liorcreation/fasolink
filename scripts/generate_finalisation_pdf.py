from pathlib import Path
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "fasolink-finalisation-livraison-client.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)


def register_fonts():
    candidates = [
        ("FasoSans", r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\segoeuib.ttf"),
        ("FasoSans", r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\seguisb.ttf"),
    ]
    for family, regular, bold in candidates:
        if Path(regular).exists() and Path(bold).exists():
            pdfmetrics.registerFont(TTFont(family, regular))
            pdfmetrics.registerFont(TTFont(f"{family}-Bold", bold))
            return family, f"{family}-Bold"
    return "Helvetica", "Helvetica-Bold"


REGULAR, BOLD = register_fonts()

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
styles.add(ParagraphStyle(
    name="CoverKicker", fontName=BOLD, fontSize=9, leading=12,
    textColor=GOLD, tracking=1.5, spaceAfter=12,
))
styles.add(ParagraphStyle(
    name="CoverTitle", fontName=BOLD, fontSize=31, leading=35,
    textColor=WHITE, alignment=TA_LEFT, spaceAfter=14,
))
styles.add(ParagraphStyle(
    name="CoverSub", fontName=REGULAR, fontSize=12, leading=18,
    textColor=colors.HexColor("#E8DED2"), spaceAfter=18,
))
styles.add(ParagraphStyle(
    name="H1Faso", fontName=BOLD, fontSize=22, leading=27,
    textColor=INK, spaceBefore=5, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="H2Faso", fontName=BOLD, fontSize=14, leading=18,
    textColor=INK, spaceBefore=10, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="BodyFaso", fontName=REGULAR, fontSize=9.2, leading=14,
    textColor=MUTED, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="SmallFaso", fontName=REGULAR, fontSize=7.7, leading=10.5,
    textColor=MUTED, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="TinyFaso", fontName=REGULAR, fontSize=6.9, leading=8.6,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="TableHeadFaso", fontName=BOLD, fontSize=7.5, leading=9,
    textColor=WHITE,
))
styles.add(ParagraphStyle(
    name="TableFaso", fontName=REGULAR, fontSize=7.3, leading=9.5,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="TableBoldFaso", fontName=BOLD, fontSize=7.3, leading=9.5,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name="CalloutFaso", fontName=REGULAR, fontSize=9, leading=13,
    textColor=INK, spaceAfter=0,
))
styles.add(ParagraphStyle(
    name="MetricValue", fontName=BOLD, fontSize=18, leading=20,
    textColor=INK, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="MetricLabel", fontName=REGULAR, fontSize=7.5, leading=10,
    textColor=MUTED, alignment=TA_LEFT,
))
styles.add(ParagraphStyle(
    name="Checklist", fontName=REGULAR, fontSize=8.6, leading=13,
    textColor=INK, leftIndent=0,
))


def P(text, style="BodyFaso"):
    return Paragraph(text, styles[style])


def bullet(text, status="A faire"):
    color = GREEN if status == "Fait" else RED if status == "Bloquant" else GOLD
    mark = "<font color='%s'><b>%s</b></font>" % (color.hexval(), "OK" if status == "Fait" else "!" if status == "Bloquant" else "-")
    return P(f"{mark} &nbsp; {text}", "Checklist")


def section_title(kicker, title, intro=None):
    parts = [P(kicker.upper(), "CoverKicker"), P(title, "H1Faso")]
    if intro:
        parts.append(P(intro, "BodyFaso"))
    parts.append(HRFlowable(width="100%", thickness=0.7, color=CLAY, spaceBefore=3, spaceAfter=10))
    return parts


def status_chip(label, color):
    return Paragraph(f"<font color='{color.hexval()}'><b>{label}</b></font>", styles["TableFaso"])


def make_table(data, widths, header=True, row_heights=None):
    converted = []
    for r, row in enumerate(data):
        converted.append([
            cell if isinstance(cell, Paragraph) else P(str(cell), "TableHeadFaso" if header and r == 0 else "TableFaso")
            for cell in row
        ])
    table = Table(converted, colWidths=widths, repeatRows=1 if header else 0, rowHeights=row_heights)
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.35, CLAY),
    ]
    if header:
        commands += [("BACKGROUND", (0, 0), (-1, 0), NAVY), ("TEXTCOLOR", (0, 0), (-1, 0), WHITE)]
        start = 1
    else:
        start = 0
    for row in range(start, len(data)):
        if (row - start) % 2 == 0:
            commands.append(("BACKGROUND", (0, row), (-1, row), colors.HexColor("#FFFDFC")))
    table.setStyle(TableStyle(commands))
    return table


def metric(value, label, tone=RED):
    return Table([[P(value, "MetricValue")], [P(label, "MetricLabel")]], colWidths=[43 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFDFC")),
        ("BOX", (0, 0), (-1, -1), 0.7, CLAY),
        ("LINEABOVE", (0, 0), (-1, 0), 3, tone),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))


def page_background(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(SAND)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setStrokeColor(CLAY)
    canvas.setLineWidth(0.4)
    canvas.line(18 * mm, 16 * mm, A4[0] - 18 * mm, 16 * mm)
    canvas.setFont(REGULAR, 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, "FasoLink - Dossier de finalisation")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"{doc.page:02d}")
    canvas.restoreState()


def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setFillColor(RED)
    canvas.circle(A4[0] - 15 * mm, A4[1] - 18 * mm, 45 * mm, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.circle(18 * mm, 24 * mm, 25 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(colors.HexColor("#FFFFFF22"))
    for i in range(7):
        y = 40 * mm + i * 19 * mm
        canvas.line(18 * mm, y, A4[0] - 18 * mm, y)
    canvas.setFillColor(colors.HexColor("#FFFFFF"))
    canvas.setFont(BOLD, 10)
    canvas.drawString(18 * mm, A4[1] - 28 * mm, "FASOLINK")
    canvas.setFont(REGULAR, 7)
    canvas.setFillColor(colors.HexColor("#D8D0C8"))
    canvas.drawRightString(A4[0] - 18 * mm, A4[1] - 28 * mm, "CONFIDENTIEL - PREPARATION DE LIVRAISON")
    canvas.setFillColor(colors.HexColor("#D8D0C8"))
    canvas.setFont(REGULAR, 8)
    canvas.drawString(18 * mm, 17 * mm, "Audit du projet - 21 septembre 2026")
    canvas.drawRightString(A4[0] - 18 * mm, 17 * mm, "Version 1.0")
    canvas.restoreState()


class FasoDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=18 * mm, bottomMargin=22 * mm, **kwargs)
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="normal")
        self.addPageTemplates([
            PageTemplate(id="cover", frames=frame, onPage=cover_page),
            PageTemplate(id="body", frames=frame, onPage=page_background),
        ])


def build_story():
    story = []
    story += [Spacer(1, 46 * mm), P("DOSSIER DE FINALISATION", "CoverKicker"), P("FasoLink", "CoverTitle"), P("Plan complet de clôture, de recette et de livraison au client", "CoverSub")]
    story += [P("Marketplace et annuaire premium des commerçants, artisans et producteurs du Burkina Faso.", "CoverSub")]
    story += [Spacer(1, 22 * mm), P("Statut actuel", "SmallFaso"), P("Pré-production avancée - fondations techniques et expérience utilisateur déjà en place", "CoverSub")]
    story += [PageBreak()]

    story += section_title("01 - Synthèse exécutive", "Ce qui est réellement prêt aujourd'hui", "FasoLink dispose déjà d'un socle solide et exploitable. La dernière ligne droite ne consiste plus à reconstruire l'application, mais à passer d'un produit techniquement avancé à une version officiellement exploitable par le client et ses vendeurs.")
    metrics = Table([[metric("09", "routes applicatives principales", GREEN), metric("OK", "lint + TypeScript + build", GREEN), metric("OK", "Firebase Auth + Firestore", GREEN), metric("4", "bloqueurs de mise en production", RED)]], colWidths=[45 * mm] * 4, style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4)]))
    story += [metrics, Spacer(1, 10)]
    story += [P("Conclusion professionnelle", "H2Faso"), P("Le produit peut être présenté au client dès maintenant comme une version avancée, mais la livraison définitive doit être conditionnée à la validation de quatre sujets externes : activation de Firebase Storage, raccordement d'un vrai moyen de paiement, finalisation des informations légales et chargement des contenus réels.", "CalloutFaso")]
    story += [Spacer(1, 8), Table([[P("URL de démonstration", "TableBoldFaso"), P("https://fasolink.pages.dev", "TableFaso")], [P("Projet Firebase", "TableBoldFaso"), P("fasolink-d6e77", "TableFaso")], [P("Stack", "TableBoldFaso"), P("Next.js 14, TypeScript, Tailwind, Framer Motion, Firebase, Cloudflare Pages", "TableFaso")]], colWidths=[43 * mm, 127 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFDFC")), ("BOX", (0, 0), (-1, -1), 0.7, CLAY), ("INNERGRID", (0, 0), (-1, -1), 0.35, CLAY), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)])), PageBreak()]

    story += section_title("02 - Périmètre déjà livré", "Les modules présents dans FasoLink", "La liste ci-dessous correspond au périmètre déjà implémenté dans le dépôt et visible dans l'application en ligne.")
    delivered = [
        ["Domaine", "Éléments déjà présents", "État"],
        ["Expérience publique", "Accueil, hero, recherche prédictive, filtres catégorie/ville/quartier, boutiques vedettes, fiches boutique et fiches produit.", "Fait"],
        ["Navigation et responsive", "Navbar desktop, bottom navigation mobile, affichage tablette, logo, splash screen et interactions Framer Motion.", "Fait"],
        ["Compte utilisateur", "Inscription, connexion Email/Password, profil, favoris persistants et états d'accès.", "Fait"],
        ["Espace vendeur", "Création de boutique, médias, dashboard, catalogue produits, disponibilité, statistiques de contacts et QR Code.", "Fait"],
        ["Confiance et modération", "Dossier CNIB/NIF, géolocalisation, badge vendeur vérifié et back-office administrateur protégé.", "Fait"],
        ["Monétisation préparée", "Essai gratuit 14 jours, demandes d'abonnement, validation webhook signée et expiration automatique.", "Préparé"],
        ["PWA et disponibilité", "Manifest, service worker, page offline et prompt d'installation.", "Fait"],
        ["Documentation légale", "Confidentialité, conditions d'utilisation et mentions légales à compléter avec les informations du propriétaire.", "À finaliser"],
    ]
    story += [make_table(delivered, [36 * mm, 104 * mm, 30 * mm]), PageBreak()]

    story += section_title("03 - Bloqueurs de livraison", "Les actions indispensables avant remise officielle", "Ces sujets ne sont pas de simples améliorations. Ils conditionnent le fonctionnement réel des uploads, des paiements et de l'identité commerciale de la plateforme.")
    blockers = [
        ["Priorité", "Action", "Pourquoi c'est indispensable", "Responsable"],
        ["P0", "Activer Firebase Storage et déployer storage.rules.", "Sans Storage, les logos, photos de boutiques et justificatifs CNIB/NIF ne peuvent pas être enregistrés.", "Client / propriétaire Firebase"],
        ["P0", "Choisir et ouvrir le compte marchand CinetPay ou PayDunya.", "Le code ne peut pas recevoir de vrais paiements sans identifiants marchands, opérateurs activés et paramètres de production.", "Client + intégrateur paiement"],
        ["P0", "Fournir les informations légales officielles.", "Les mentions légales doivent contenir l'éditeur, l'adresse, le contact, le responsable de publication et les références de l'entreprise.", "Client"],
        ["P0", "Remplacer les contenus de démonstration par les contenus réels.", "Les 9 boutiques et 27 produits du mock-data servent à la démo, pas à la mise en ligne commerciale définitive.", "Client + équipe contenu"],
        ["P1", "Revalider le cron d'expiration et son secret Cloudflare.", "Les abonnements échus doivent suspendre automatiquement les boutiques concernées.", "Technique"],
        ["P1", "Réaliser la recette finale avec comptes et appareils réels.", "Elle garantit que le client peut exploiter l'application avant la signature de réception.", "Client + technique"],
    ]
    story += [make_table(blockers, [15 * mm, 48 * mm, 73 * mm, 34 * mm]), Spacer(1, 10)]
    story += [Table([[P("Point d'attention", "TableBoldFaso"), P("Le site peut rester accessible sur Cloudflare même si Firebase Storage ou le paiement réel ne sont pas finalisés. Cela ne signifie pas que la chaîne vendeur est prête pour une exploitation commerciale complète.", "TableFaso")]], colWidths=[35 * mm, 135 * mm], style=TableStyle([("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#FFF2E5")), ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#FFFDFC")), ("BOX", (0, 0), (-1, -1), 0.7, GOLD), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)])), PageBreak()]

    story += section_title("04 - Plan de finalisation technique", "Séquence recommandée de clôture", "L'ordre est important : on sécurise les services externes avant de faire la recette métier, puis on fige la version livrée.")
    steps = [
        ["Etape", "Travail", "Critère de sortie"],
        ["1. Firebase", "Activer Storage sur le projet fasolink-d6e77, choisir la facturation adaptée, déployer storage.rules et contrôler les domaines autorisés.", "Upload logo/photo réussi par un vendeur ; justificatif privé visible uniquement par vendeur/admin."],
        ["2. Authentification", "Tester Email/Password, session anonyme d'onboarding vendeur, renouvellement de session et custom claim admin.", "Chaque rôle accède uniquement à ses écrans et les erreurs sont compréhensibles."],
        ["3. Paiement", "Créer le compte marchand, renseigner les secrets Cloudflare, configurer les opérateurs, brancher le webhook et tester les signatures.", "Un paiement accepté active une souscription et publie la boutique une seule fois."],
        ["4. Expiration", "Déployer ou revalider le worker fasolink-expiry-cron, le secret CRON_SECRET et l'URL API.", "Une souscription échue passe à expired et la boutique est suspendue si nécessaire."],
        ["5. Données", "Importer les boutiques, produits, catégories, horaires, numéros WhatsApp et visuels réels ; supprimer les données de démonstration.", "Les contenus publiés sont validés par le client et respectent sa charte."],
        ["6. Release", "Créer une version de production, sauvegarder les variables, documenter les accès et conserver l'URL de rollback.", "Version livrée reproductible et récupérable par un autre technicien."],
    ]
    story += [make_table(steps, [22 * mm, 78 * mm, 70 * mm]), Spacer(1, 12)]
    story += [P("Commandes techniques prévues", "H2Faso"), P("Les commandes existent déjà dans le projet : npm run lint, npx tsc --noEmit, npm run build, npm run verify, npm run pages:build et npm run pages:deploy. Elles ne remplacent pas la recette métier, mais elles empêchent de livrer une version qui ne compile pas ou qui casse les règles Firebase.", "BodyFaso")]
    story += [PageBreak()]

    story += section_title("05 - Recette fonctionnelle", "Scénarios à exécuter avant signature", "Chaque scénario doit être testé avec un compte de test et, pour les actions sensibles, avec un compte de production contrôlé. Les résultats doivent être consignés dans un procès-verbal de recette.")
    qa = [
        ["ID", "Scénario", "Résultat attendu", "Plateformes"],
        ["QA-01", "Ouvrir le site puis naviguer Accueil / Espace vendeur / Profil.", "Splash une seule fois au lancement, navigation fluide, aucune page blanche.", "iPhone, Android, Windows, macOS"],
        ["QA-02", "Créer un compte et se reconnecter.", "Profil retrouvé après fermeture et reconnexion ; erreurs lisibles.", "Safari iOS, Chrome Android, Chrome desktop"],
        ["QA-03", "Créer une boutique avec logo et galerie.", "Les fichiers sont téléversés, les URL sont enregistrées et la boutique reste pending avant activation.", "iPhone + desktop"],
        ["QA-04", "Activer l'essai gratuit.", "La boutique est active, la date de fin est correcte et le dashboard affiche le bon statut.", "Toutes"],
        ["QA-05", "Déposer un dossier CNIB/NIF.", "Fichiers privés, taille/type contrôlés, statut pending, consultation admin possible.", "iPhone + Android"],
        ["QA-06", "Valider ou suspendre une boutique dans l'admin.", "Le statut se met à jour, la boutique apparaît ou disparaît selon la décision.", "Desktop recommandé"],
        ["QA-07", "Ajouter, modifier puis supprimer un produit.", "Catalogue cohérent sur dashboard, fiche boutique et fiche produit.", "Toutes"],
        ["QA-08", "Cliquer sur WhatsApp et générer le QR Code.", "Numéro correct, message prérempli, QR Code lisible et téléchargeable.", "Mobile + desktop"],
        ["QA-09", "Paiement accepté, refusé, signature invalide, doublon.", "Webhook sécurisé, idempotent et sans activation frauduleuse.", "Environnement de test"],
        ["QA-10", "Naviguer en connexion faible / hors ligne.", "Page offline accessible, interface utilisable, erreurs non bloquantes.", "Mobile"],
    ]
    story += [make_table(qa, [17 * mm, 50 * mm, 75 * mm, 28 * mm]), PageBreak()]

    story += section_title("06 - Données et contenus client", "Ce qui doit venir du propriétaire de FasoLink", "La qualité perçue lors de la livraison dépend autant du contenu que du code. Les éléments ci-dessous doivent être fournis, validés et conservés dans un dossier partagé.")
    content = [
        ["Bloc", "A fournir", "Statut"],
        ["Identité", "Nom commercial définitif, logo final, couleurs validées, slogan et coordonnées officielles.", "Client"],
        ["Légal", "Raison sociale ou nom de l'éditeur, adresse, téléphone, email, responsable de publication et politique de conservation.", "Client + conseil juridique"],
        ["Boutiques", "Liste des vendeurs, noms, catégories, villes, quartiers, horaires, numéros WhatsApp, descriptions, logos et photos.", "Client / équipe contenu"],
        ["Produits", "Noms, prix en FCFA, descriptions, disponibilité, photos et références.", "Client / vendeurs"],
        ["Paiement", "Compte marchand, opérateurs autorisés, URL de retour, secret webhook et procédure de remboursement/support.", "Client + prestataire"],
        ["Support", "Numéro WhatsApp/email de support, horaires de réponse, procédure de signalement et responsable de modération.", "Client"],
    ]
    story += [make_table(content, [30 * mm, 112 * mm, 28 * mm]), Spacer(1, 12)]
    story += [P("Règle de qualité", "H2Faso"), P("Aucun numéro de téléphone, prix, boutique ou texte légal ne doit être inventé pour la version finale. Les données de démonstration peuvent rester sur un environnement de présentation séparé, mais elles ne doivent pas être confondues avec les données officielles du client.", "CalloutFaso"), PageBreak()]

    story += section_title("07 - Budget et responsabilités", "Ce qui est inclus, ce qui peut coûter de l'argent", "Les coûts ci-dessous distinguent le travail de finalisation du développeur et les services externes qui dépendent du client ou de leurs fournisseurs.")
    costs = [
        ["Poste", "Nature", "Traitement"],
        ["Corrections et contrôles du code actuel", "Travail technique", "Inclus dans la finalisation du périmètre actuel ; lint, TypeScript, build et vérifications."],
        ["Cloudflare Pages", "Hébergement", "Généralement gratuit dans les quotas du plan choisi ; vérifier les limites et la facturation du compte."],
        ["Firebase Auth / Firestore", "Backend", "Utilisable dans les quotas ; facturation possible selon usage et configuration du projet."],
        ["Firebase Storage", "Médias et justificatifs", "Activation et éventuelle facturation Blaze à valider par le propriétaire du projet."],
        ["CinetPay / PayDunya", "Paiements", "Frais de transaction et conditions commerciales du prestataire ; aucun montant ne doit être promis sans contrat."],
        ["Nom de domaine", "Adresse professionnelle", "Achat et renouvellement annuels auprès du registrar choisi par le client."],
        ["SMS, email transactionnel, analytics avancés", "Services optionnels", "Non indispensables au socle actuel ; à budgéter seulement si le client les demande."],
        ["Maintenance et support", "Après livraison", "Contrat séparé recommandé : mises à jour, surveillance, assistance et évolutions."],
    ]
    story += [make_table(costs, [48 * mm, 37 * mm, 85 * mm]), Spacer(1, 12)]
    story += [P("Important", "H2Faso"), P("Aucun paiement externe ne doit être effectué sans validation du propriétaire de FasoLink. Le développeur peut préparer le branchement et la documentation, mais le compte marchand, la facturation Firebase, le domaine et les frais de transaction appartiennent au client.", "CalloutFaso"), PageBreak()]

    story += section_title("08 - Dossier de livraison", "Ce qui doit être remis au client", "La livraison professionnelle ne se limite pas à une URL. Elle doit permettre au client de comprendre, exploiter, sécuriser et reprendre le projet.")
    handover = [
        ["Livrable", "Contenu"],
        ["URL de production", "https://fasolink.pages.dev ou domaine personnalisé validé."],
        ["Code source", "Dépôt Git, branche de production, historique des changements et version livrée."],
        ["Accès", "Cloudflare, Firebase, domaine, passerelle de paiement et comptes administrateurs remis par un canal sécurisé."],
        ["Documentation technique", "README, DEPLOY.md, variables d'environnement, règles Firebase, webhook et cron."],
        ["Guide administrateur", "Connexion à /admin, gestion des boutiques, vérification des vendeurs, suppression des justificatifs et modération."],
        ["Guide vendeur", "Création de boutique, paiement, catalogue, QR Code, vérification et lecture des statistiques."],
        ["PV de recette", "Scénarios QA, résultats, appareils testés, anomalies connues et validation client."],
        ["Plan de sauvegarde", "Procédure de récupération du code, données Firebase, secrets et restauration en cas d'incident."],
    ]
    story += [make_table(handover, [45 * mm, 125 * mm]), Spacer(1, 12)]
    story += [P("Transfert sécurisé", "H2Faso"), P("Les secrets ne doivent jamais être envoyés dans un message public, un PDF ou le dépôt Git. Ils doivent être transférés directement dans Cloudflare/Firebase ou via un gestionnaire de mots de passe. Après la livraison, le client doit remplacer les accès temporaires et activer la double authentification lorsque le service le permet.", "CalloutFaso"), PageBreak()]

    story += section_title("08 BIS - Gestion propriétaire", "Paramètres de boutique livrés", "La vitrine FasoLink dispose désormais d'un espace de gestion réservé au compte qui a créé la boutique. Cette fonctionnalité améliore l'autonomie du vendeur sans exposer les contrôles sensibles de la plateforme.")
    settings = [
        ["Élément", "Implémentation", "État"],
        ["Accès depuis la vitrine", "Le bouton Paramètres / Gérer n'apparaît que pour l'utilisateur dont l'UID correspond à owner_id.", "Fait"],
        ["Authentification vendeur", "La création d'une boutique exige désormais une session email authentifiée ; les visiteurs et comptes anonymes sont redirigés vers Connexion / Inscription.", "Fait"],
          ["Portefeuille vendeur", "La page /vendeur/boutiques regroupe toutes les vitrines du compte connecté, avec recherche, statuts, produits, contacts et accès direct à Modifier / Voir la vitrine.", "Fait"],
          ["Sélecteur dashboard fluide", "La boutique active est choisie en état local sans navigation ni rechargement ; le dashboard et ProductManager se réinitialisent immédiatement sur le shop_id choisi.", "Fait"],
          ["Synchronisation automatique", "Navigation interne sans rechargement forcé ; mise à jour locale immédiate du catalogue et synchronisation douce des pages après reconnexion, retour dans l'onglet ou attente prolongée.", "Fait"],
          ["Périmètre tech", "Nettoyage de production effectué : seules Faso Mobile et Rachedel Store électronique sont conservées ; les anciennes catégories et Apple Store sont exclues du catalogue et du Super Admin.", "Fait"],
          ["Avis visiteurs", "Les visiteurs ayant contacté la boutique peuvent publier un avis ; le propriétaire ne voit pas le formulaire et Firestore bloque aussi toute auto-évaluation.", "Fait"],
        ["Route dédiée", "/boutiques/[id]/parametres, responsive mobile, tablette et desktop, publiée en Edge Runtime Cloudflare.", "Fait"],
        ["Informations modifiables", "Nom, description, ville, quartier / secteur et numéro WhatsApp Business.", "Fait"],
        ["Numérotation Burkina", "La saisie conserve le zéro éventuel ; le format national à 8 chiffres est contrôlé et enregistré au format canonique +226.", "Fait"],
        ["Protection serveur", "Les règles Firestore limitent les écritures du propriétaire aux champs publics validés ; owner_id, slug, statut, vérification et abonnements restent protégés.", "Fait"],
        ["Parcours vendeur", "Accès direct au dashboard pour les produits, la licence, la vérification, les médias et les statistiques.", "Fait"],
        ["Contrôle de publication", "Rules Firestore déployées sur fasolink-d6e77 ; build Cloudflare confirmé success sur le commit fb2aa55.", "Fait"],
    ]
    story += [make_table(settings, [38 * mm, 102 * mm, 30 * mm]), Spacer(1, 12)]
    story += [P("Utilisation recommandée", "H2Faso"), P("Depuis la vitrine d'une boutique, le propriétaire connecté sélectionne Paramètres. Il peut mettre à jour les coordonnées visibles puis enregistrer. Un autre compte peut consulter la boutique mais ne voit pas cette action et ne peut pas écrire ses informations sensibles, même en appelant directement Firebase.", "CalloutFaso"), PageBreak()]

    story += section_title("09 - Critères de réception", "Quand peut-on dire que FasoLink est finalisé ?", "La livraison finale est recommandée uniquement lorsque tous les critères P0 sont validés et que le client a signé la recette.")
    acceptance = [
        ["Critère", "Preuve attendue", "Validé"],
        ["Accès public", "URL de production disponible en HTTPS sur desktop, tablette et mobile.", "□"],
        ["Authentification", "Création, connexion, déconnexion et récupération de profil testées.", "□"],
        ["Storage", "Logo, galerie et justificatif privé testés avec règles de sécurité.", "□"],
        ["Vendeur", "Boutique, produits, QR Code, contacts et dashboard validés.", "□"],
        ["Administration", "Claim admin, modération et suppression des pièces testés.", "□"],
        ["Paiement", "Scénarios accepté/refusé/invalide/doublon testés sur l'environnement choisi.", "□"],
        ["Expiration", "Cron exécuté et suspension d'une boutique échue vérifiée.", "□"],
        ["Légal", "Mentions légales, confidentialité et conditions complétées par le client.", "□"],
        ["Contenus", "Données réelles validées et démo distinguée de la production.", "□"],
        ["Performance", "Navigation sans erreur console bloquante, images et parcours essentiels vérifiés.", "□"],
        ["Transfert", "Accès, documentation et procédure de support remis.", "□"],
    ]
    story += [make_table(acceptance, [53 * mm, 105 * mm, 12 * mm]), Spacer(1, 14)]
    story += [P("Décision recommandée", "H2Faso"), P("Livrer en deux temps : d'abord une démonstration contrôlée au client avec les données de test, puis la mise en production commerciale après activation de Storage, paiement réel, contenus officiels et signature du procès-verbal de recette.", "CalloutFaso"), PageBreak()]

    story += section_title("10 - Plan d'action final", "Checklist opérationnelle", "Cette page peut servir de feuille de route de clôture entre le développeur et le client.")
    action_items = [
        ("Technique", "Finaliser Storage, règles, tests d'upload et nettoyage des données de test."),
        ("Paiement", "Choisir l'agrégateur, obtenir les identifiants, configurer les secrets et effectuer un test de bout en bout."),
        ("Données", "Recevoir les contenus réels, contrôler les prix et numéros, puis publier le jeu de données validé."),
        ("Juridique", "Compléter les mentions légales, confidentialité, conditions et politique de modération."),
        ("Exploitation", "Créer le compte admin définitif, documenter le support, le cron et la procédure d'incident."),
        ("Recette", "Tester les 10 scénarios QA sur iPhone, Android, tablette, Windows et macOS."),
        ("Release", "Figer la version, sauvegarder, déployer, contrôler HTTP/HTTPS, puis remettre les accès."),
        ("Réception", "Faire signer le PV, noter les réserves éventuelles et définir la maintenance post-livraison."),
    ]
    story += [Table([[P("□", "TableBoldFaso"), P(label, "TableBoldFaso"), P(text, "TableFaso")] for label, text in action_items], colWidths=[10 * mm, 35 * mm, 125 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFDFC")), ("BOX", (0, 0), (-1, -1), 0.7, CLAY), ("INNERGRID", (0, 0), (-1, -1), 0.35, CLAY), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)])), Spacer(1, 16)]
    story += [P("Synthèse finale", "H2Faso"), P("FasoLink n'est pas au point zéro : l'essentiel du produit est construit. La finalisation consiste à connecter les services externes du propriétaire, remplacer la démonstration par ses données officielles, effectuer une recette multi-appareils et remettre un dossier sécurisé. Une fois ces étapes validées, le client peut exploiter la plateforme avec un périmètre clair et une base technique documentée.", "CalloutFaso"), Spacer(1, 18)]
    signature = Table([[P("Pour FasoLink", "TableHeadFaso"), P("Pour le client", "TableHeadFaso")], [P("Nom : ____________________________<br/><br/>Date : ____________________________<br/><br/>Signature : ________________________", "TableFaso"), P("Nom : ____________________________<br/><br/>Date : ____________________________<br/><br/>Signature : ________________________", "TableFaso")]], colWidths=[85 * mm, 85 * mm], rowHeights=[10 * mm, 34 * mm], style=TableStyle([("BACKGROUND", (0, 0), (-1, 0), NAVY), ("BOX", (0, 0), (-1, -1), 0.7, CLAY), ("INNERGRID", (0, 0), (-1, -1), 0.35, CLAY), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    story += [signature]
    return story


if __name__ == "__main__":
    doc = FasoDocTemplate(str(OUT), title="FasoLink - Finalisation et livraison client", author="FasoLink")
    story = build_story()
    doc.handle_nextPageTemplate("body")
    doc.build(story)
    print(OUT)
