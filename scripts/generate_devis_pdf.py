from pathlib import Path
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "fasolink-devis-client.pdf"

RED = colors.HexColor("#D62828")
GREEN = colors.HexColor("#1F9254")
GOLD = colors.HexColor("#F4A93C")
INK = colors.HexColor("#20313B")
MUTED = colors.HexColor("#66747B")
SAND = colors.HexColor("#F7F4EE")
PALE_RED = colors.HexColor("#FCEAEA")
PALE_GREEN = colors.HexColor("#E8F5ED")
PALE_GOLD = colors.HexColor("#FFF4D9")
LINE = colors.HexColor("#E7E1D8")


def money(value: int) -> str:
    return f"{value:,.0f}".replace(",", " ") + " FCFA"


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverKicker", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=9, leading=12, textColor=GOLD, tracking=1.5, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=34, leading=38, textColor=colors.white, alignment=TA_LEFT,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="CoverSub", parent=styles["Normal"], fontName="Helvetica",
    fontSize=13, leading=18, textColor=colors.white, spaceAfter=18,
))
styles.add(ParagraphStyle(
    name="H1Faso", parent=styles["Heading1"], fontName="Helvetica-Bold",
    fontSize=19, leading=24, textColor=INK, spaceBefore=6, spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="H2Faso", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=12, leading=15, textColor=INK, spaceBefore=10, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="BodyFaso", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9.3, leading=13.3, textColor=INK, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="SmallFaso", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=7.8, leading=10.5, textColor=MUTED, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="TableHead", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=8.2, leading=10, textColor=colors.white,
))
styles.add(ParagraphStyle(
    name="TableCell", parent=styles["Normal"], fontName="Helvetica",
    fontSize=8.2, leading=10.8, textColor=INK,
))
styles.add(ParagraphStyle(
    name="TableCellBold", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=8.2, leading=10.8, textColor=INK,
))
styles.add(ParagraphStyle(
    name="Amount", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=10.5, leading=13, textColor=INK, alignment=TA_RIGHT,
))
styles.add(ParagraphStyle(
    name="AmountBig", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=17, leading=20, textColor=RED, alignment=TA_RIGHT,
))
styles.add(ParagraphStyle(
    name="Callout", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9, leading=13, textColor=INK, leftIndent=8, rightIndent=8,
    spaceBefore=3, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="BulletFaso", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9, leading=13, textColor=INK, leftIndent=12, firstLineIndent=-8,
    bulletIndent=0, spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="Footer", parent=styles["Normal"], fontName="Helvetica",
    fontSize=7.5, leading=9, textColor=MUTED,
))


def P(text: str, style: str = "BodyFaso") -> Paragraph:
    return Paragraph(text, styles[style])


def bullet(text: str) -> Paragraph:
    return Paragraph(f"- {text}", styles["BulletFaso"])


def section_title(number: str, title: str):
    return KeepTogether([
        P(f'<font color="#D62828">{number}</font>&nbsp;&nbsp;{title}', "H1Faso"),
        Table([["", ""]], colWidths=[22 * mm, 145 * mm], rowHeights=[1.2 * mm],
              style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), GOLD),
                                ("LINEBELOW", (0, 0), (-1, -1), 0, GOLD)])),
        Spacer(1, 4),
    ])


def simple_table(data, widths, header=True, aligns=None, row_bgs=None):
    converted = []
    for r, row in enumerate(data):
        converted.append([
            item if isinstance(item, Paragraph) else P(str(item), "TableHead" if header and r == 0 else "TableCell")
            for item in row
        ])
    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    if header:
        cmds += [("BACKGROUND", (0, 0), (-1, 0), INK),
                 ("TEXTCOLOR", (0, 0), (-1, 0), colors.white)]
        start = 1
    else:
        start = 0
    if row_bgs:
        for idx, bg in row_bgs.items():
            cmds.append(("BACKGROUND", (0, idx), (-1, idx), bg))
    for r in range(start, len(data)):
        if r % 2 == 0 and not row_bgs:
            cmds.append(("BACKGROUND", (0, r), (-1, r), colors.white))
    if aligns:
        for col, align in aligns.items():
            cmds.append(("ALIGN", (col, 0), (col, -1), align))
    return Table(converted, colWidths=widths, repeatRows=1 if header else 0,
                 hAlign="LEFT", style=TableStyle(cmds))


def draw_header_footer(canvas, doc):
    canvas.saveState()
    page = canvas.getPageNumber()
    if page > 1:
        canvas.setFillColor(INK)
        canvas.setFont("Helvetica-Bold", 8)
        canvas.drawString(18 * mm, 285 * mm, "FasoLink")
        canvas.setFillColor(RED)
        canvas.rect(38 * mm, 283.7 * mm, 10 * mm, 1.2 * mm, fill=1, stroke=0)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 7.5)
        canvas.drawRightString(192 * mm, 285 * mm, "Devis commercial - 11 septembre 2026")
        canvas.setStrokeColor(LINE)
        canvas.line(18 * mm, 280.5 * mm, 192 * mm, 280.5 * mm)
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 15 * mm, 192 * mm, 15 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(18 * mm, 10.5 * mm, "Document commercial confidentiel - FasoLink")
    canvas.drawRightString(192 * mm, 10.5 * mm, f"Page {page}")
    canvas.restoreState()


class QuoteDocTemplate(BaseDocTemplate):
    def __init__(self, filename, **kwargs):
        super().__init__(filename, pagesize=A4, rightMargin=18 * mm,
                         leftMargin=18 * mm, topMargin=28 * mm,
                         bottomMargin=22 * mm, **kwargs)
        frame = Frame(self.leftMargin, self.bottomMargin,
                      self.width, self.height, id="normal")
        self.addPageTemplates([PageTemplate(id="main", frames=frame,
                                            onPage=draw_header_footer)])


def build_pdf():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc = QuoteDocTemplate(str(OUT), title="Devis commercial FasoLink",
                           author="FasoLink")
    story = []

    # Cover
    cover = Table([
        [P("DEVIS COMMERCIAL", "CoverKicker")],
        [P("FasoLink", "CoverTitle")],
        [P("Conception et mise en production d'une plateforme web de promotion des commerces, artisans et producteurs locaux du Burkina Faso.", "CoverSub")],
        [Spacer(1, 12)],
        [P("Annuaire professionnel - marketplace de vitrines - contact WhatsApp - Mobile Money - PWA", "CoverSub")],
    ], colWidths=[174 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), INK),
        ("LEFTPADDING", (0, 0), (-1, -1), 16),
        ("RIGHTPADDING", (0, 0), (-1, -1), 16),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story += [Spacer(1, 18 * mm), cover, Spacer(1, 14 * mm)]
    summary = Table([
        [P("CLIENT", "SmallFaso"), P("À compléter", "TableCellBold"), P("DEVIS", "SmallFaso"), P("FL-2026-001", "TableCellBold")],
        [P("PROJET", "SmallFaso"), P("FasoLink", "TableCellBold"), P("DATE", "SmallFaso"), P("11 septembre 2026", "TableCellBold")],
        [P("VALIDITÉ", "SmallFaso"), P("30 jours", "TableCellBold"), P("DÉLAI", "SmallFaso"), P("6 à 8 semaines", "TableCellBold")],
    ], colWidths=[25 * mm, 62 * mm, 25 * mm, 62 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SAND),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story += [summary, Spacer(1, 15 * mm)]
    total_box = Table([[P("MONTANT TOTAL DE LA PRESTATION", "TableCellBold"), P(money(3850000), "AmountBig")]],
                      colWidths=[100 * mm, 74 * mm], style=TableStyle([
                          ("BACKGROUND", (0, 0), (-1, -1), PALE_GOLD),
                          ("BOX", (0, 0), (-1, -1), 1, GOLD),
                          ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                          ("LEFTPADDING", (0, 0), (-1, -1), 10),
                          ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                          ("TOPPADDING", (0, 0), (-1, -1), 12),
                          ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                      ]))
    story += [total_box, Spacer(1, 8 * mm), P("Version commerciale complète, incluant la finalisation des fonctions actuellement simulées ou partielles.", "SmallFaso"), PageBreak()]

    # Page 2 - understanding and audit
    story += [section_title("01", "Objet du devis"),
              P("Le présent devis couvre la finalisation et la mise en production de FasoLink, une plateforme web mobile-first destinée à référencer les commerçants, artisans et producteurs locaux du Burkina Faso. La plateforme permet aux acheteurs de découvrir une boutique, consulter ses produits et contacter directement le vendeur via WhatsApp.")]
    story += [P("Le projet existant constitue un MVP technique avancé : le build de production passe correctement et le contrôle qualité statique ne remonte pas d'erreur. La présente proposition inclut cependant les travaux nécessaires pour transformer ce MVP en service commercial exploitable.")]

    story += [section_title("02", "Diagnostic de la version existante")]
    diag = [
        ["Élément", "État constaté", "Traitement prévu"],
        ["Interface et parcours publics", "Développés et navigables", "Ajustements et recette finale"],
        ["Recherche, filtres, géolocalisation", "Développés", "Tests sur appareils et données réelles"],
        ["Fiches boutiques et produits", "Développées", "SEO, contenus et recette"],
        ["Firebase, Firestore, Storage", "Présents", "Durcissement des règles et supervision"],
        ["Paiement Mobile Money", "Simulation locale", "Branchement CinetPay ou PayDunya + webhook sécurisé"],
        ["Vérification CNIB/NIF", "Formulaire de démonstration", "Stockage, workflow et validation administrateur"],
        ["Tableau de bord vendeur", "Partiellement démonstratif", "Compte propriétaire et données réelles"],
        ["Back-office administrateur", "Non présent", "Création d'une interface de modération"],
        ["Tests automatisés", "Non présents", "Plan de recette et tests de non-régression"],
    ]
    story += [simple_table(diag, [43 * mm, 56 * mm, 75 * mm], aligns={0: "LEFT"}), Spacer(1, 6 * mm)]
    note = Table([[P("Point important : le paiement visible dans l'interface est actuellement une simulation. Le montant du devis comprend son intégration réelle et la sécurisation du flux avant ouverture commerciale.", "Callout")]], colWidths=[174 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_RED),
        ("BOX", (0, 0), (-1, -1), 0.6, RED),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [note, PageBreak()]

    # Page 3 - quote details
    story += [section_title("03", "Détail financier de la prestation")]
    quote = [
        ["Lot", "Prestation incluse", "Montant"],
        ["01", "Audit, reprise du projet, cadrage, configuration des environnements et préparation de la livraison.", money(200000)],
        ["02", "Interface UI/UX responsive, identité visuelle FasoLink, adaptation mobile et finitions d'ergonomie.", money(450000)],
        ["03", "Annuaire public, recherche, filtres, proximité, fiches boutiques, fiches produits, WhatsApp et SEO de base.", money(650000)],
        ["04", "Avis clients, suivi des contacts, statistiques de conversion et parcours de mise en relation.", money(350000)],
        ["05", "Espace vendeur, création de boutique, gestion de produits, médias, abonnements, essai gratuit et QR Code.", money(500000)],
        ["06", "Authentification persistante, profils, droits propriétaires, favoris et sécurisation des accès.", money(300000)],
        ["07", "Paiement Mobile Money réel, intégration passerelle, webhook sécurisé, idempotence et activation automatique.", money(550000)],
        ["08", "Vérification CNIB/NIF, stockage sécurisé, workflow de validation et mini back-office administrateur.", money(450000)],
        ["09", "Tests, optimisation, sécurité, déploiement, documentation, formation et garantie corrective de 30 jours.", money(400000)],
        ["", "TOTAL DE LA PRESTATION", money(3850000)],
    ]
    story += [simple_table(quote, [13 * mm, 117 * mm, 44 * mm], aligns={2: "RIGHT"}), Spacer(1, 7 * mm)]
    story += [P("Les montants correspondent à la prestation de conception, développement, intégration et mise en production. Les frais facturés par les services tiers sont traités séparément dans la section financière.", "SmallFaso")]

    story += [section_title("04", "Fonctionnalités livrées")]
    feature_data = [
        ["Acheteur", "Vendeur", "Administration"],
        ["Recherche par nom, produit, catégorie, ville et quartier", "Inscription d'une boutique et ajout de médias", "Gestion des boutiques et statuts"],
        ["Géolocalisation et boutiques proches", "Catalogue et produits", "Validation des dossiers CNIB/NIF"],
        ["Fiches boutiques et produits", "Plans mensuel, trimestriel, annuel", "Modération des avis"],
        ["WhatsApp avec message prérempli", "Statistiques de contacts et QR Code", "Supervision des abonnements"],
        ["Avis et disponibilité", "Vérification vendeur", "Suspension ou publication"],
        ["Installation PWA et mode dégradé", "Paiement Mobile Money", "Journalisation et contrôle"],
    ]
    story += [simple_table(feature_data, [58 * mm, 58 * mm, 58 * mm])]
    story += [PageBreak()]

    # Page 4 - scope and terms
    story += [section_title("05", "Conditions commerciales")]
    terms = [
        ["Délai indicatif", "6 à 8 semaines après réception des contenus, accès techniques et validation du périmètre."],
        ["Échéancier", "40 % au démarrage, 40 % à la validation de la version bêta, 20 % à la mise en production."],
        ["Garantie", "30 jours de corrections gratuites sur les fonctionnalités prévues au présent devis."],
        ["Validité du devis", "30 jours à compter du 11 septembre 2026."],
        ["Formation", "Une session de prise en main à distance ou sur site, selon disponibilité des parties."],
        ["Propriété", "Remise du code source et des éléments de configuration après règlement complet."],
    ]
    story += [simple_table([["Condition", "Modalité"]] + terms, [42 * mm, 132 * mm]), Spacer(1, 5 * mm)]
    story += [P("Échéancier financier", "H2Faso")]
    payments = [
        ["Étape", "Pourcentage", "Montant"],
        ["Démarrage du projet", "40 %", money(1540000)],
        ["Validation de la version bêta", "40 %", money(1540000)],
        ["Mise en production", "20 %", money(770000)],
        ["Total", "100 %", money(3850000)],
    ]
    story += [simple_table(payments, [82 * mm, 34 * mm, 58 * mm], aligns={1: "CENTER", 2: "RIGHT"}), Spacer(1, 6 * mm)]

    story += [section_title("06", "Éléments à fournir par le client")]
    for item in [
        "Nom, logo et informations légales du projet FasoLink.",
        "Liste initiale des boutiques, produits, prix, photos et numéros WhatsApp.",
        "Comptes Firebase, Cloudflare et nom de domaine, ou autorisation de les créer.",
        "Compte marchand de la passerelle de paiement choisie et pièces administratives demandées.",
        "Textes légaux : conditions d'utilisation, politique de confidentialité et politique de modération.",
        "Personne référente pour valider les écrans, les contenus et les paiements de recette.",
    ]:
        story.append(bullet(item))

    story += [PageBreak()]
    story += [section_title("07", "Hors périmètre")]
    for item in [
        "Application mobile native Android ou iOS.",
        "Panier acheteur, commande, livraison et paiement d'un achat de produit.",
        "Traduction en mooré ou en dioula.",
        "Production de photos, vidéos, textes marketing ou campagne publicitaire.",
        "Frais de domaine, hébergement, Firebase, passerelle de paiement et commissions Mobile Money.",
        "Validation juridique des documents, gestion quotidienne des dossiers ou modération éditoriale après livraison.",
    ]:
        story.append(bullet(item))

    # Page 5 - operating costs and business model
    story += [section_title("08", "Budget de fonctionnement à prévoir")]
    running = [
        ["Poste", "Budget indicatif", "Observation"],
        ["Nom de domaine .bf", "20 000 FCFA / an", "Enregistrement et renouvellement à prévoir."],
        ["Cloudflare Pages", "0 FCFA au lancement", "Forfait gratuit possible dans les limites de la plateforme."],
        ["Firebase", "Variable", "Quota gratuit au démarrage, puis facturation à la consommation."],
        ["Passerelle de paiement", "Variable", "Commissions par transaction selon l'opérateur et le contrat."],
        ["Maintenance FasoLink", "75 000 FCFA / mois", "Correctifs, suivi technique et petites évolutions."],
    ]
    story += [simple_table(running, [47 * mm, 42 * mm, 85 * mm]), Spacer(1, 6 * mm)]
    story += [P("Les frais de transaction ne sont pas inclus dans le prix de développement. Les grilles publiques des passerelles doivent être confirmées au moment de l'ouverture du compte marchand.", "SmallFaso")]

    story += [section_title("09", "Modèle économique prévu dans FasoLink")]
    plans = [
        ["Formule", "Prix", "Avantages principaux"],
        ["Mensuel", "5 000 FCFA", "Vitrine, jusqu'à 15 produits, WhatsApp et statistiques."],
        ["Trimestriel", "13 500 FCFA", "Produits illimités, badge vérifié et mise en avant catégorie."],
        ["Annuel", "48 000 FCFA", "Position prioritaire, analytics complet et support prioritaire."],
        ["Essai", "14 jours gratuits", "Découverte du service sans carte bancaire."],
    ]
    story += [simple_table(plans, [38 * mm, 38 * mm, 98 * mm]), Spacer(1, 6 * mm)]
    callout = Table([[P("Recommandation commerciale : remettre le devis à 3 850 000 FCFA pour la version complète. Si le client souhaite uniquement une démonstration du MVP actuel, une version limitée peut être proposée séparément, mais elle ne doit pas être présentée comme une plateforme de paiement et de vérification déjà opérationnelle.", "Callout")]], colWidths=[174 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_GREEN),
        ("BOX", (0, 0), (-1, -1), 0.6, GREEN),
        ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [callout, PageBreak()]

    # Page 6 - acceptance and signatures
    story += [section_title("10", "Critères de recette")]
    for item in [
        "Un acheteur trouve une boutique par nom, produit, catégorie, ville ou proximité.",
        "Un acheteur consulte une fiche boutique, consulte les produits et contacte le vendeur via WhatsApp.",
        "Un vendeur crée sa boutique, ajoute ses produits et téléverse ses médias.",
        "Un paiement confirmé active correctement l'abonnement et la publication de la boutique.",
        "Un dossier de vérification passe par les statuts en attente, validé ou refusé depuis l'administration.",
        "Le tableau de bord affiche les contacts et l'état réel de l'abonnement du vendeur connecté.",
        "L'application est responsive, installable en PWA et dispose d'une page hors ligne.",
        "Les règles d'accès empêchent une modification non autorisée des données d'une boutique.",
    ]:
        story.append(bullet(item))

    story += [section_title("11", "Acceptation du devis")]
    story.append(P("La signature du présent devis vaut acceptation du périmètre, du montant et de l'échéancier indiqués ci-dessus. Toute fonctionnalité non listée fera l'objet d'un avenant ou d'un devis complémentaire.", "BodyFaso"))
    sign = Table([
        [P("Pour le prestataire", "TableCellBold"), P("Pour le client", "TableCellBold")],
        [P("Nom : _______________________________<br/><br/>Signature : __________________________<br/><br/>Date : ________________________________", "BodyFaso"), P("Nom : _______________________________<br/><br/>Signature : __________________________<br/><br/>Date : ________________________________", "BodyFaso")],
    ], colWidths=[87 * mm, 87 * mm], rowHeights=[12 * mm, 47 * mm], style=TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, LINE),
        ("BACKGROUND", (0, 0), (-1, 0), SAND),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story += [sign, Spacer(1, 8 * mm)]
    story += [P("Repères consultés pour le chiffrage : tarifs indicatifs de plateformes web au Burkina Faso, règles et tarifs de référence du domaine .bf, documentation de prix Firebase et limites Cloudflare Pages. Les coûts des services tiers restent soumis à leurs conditions commerciales en vigueur.", "SmallFaso")]
    story += [P("Sources : tigsi-sarl.com/fr/tarifs | sabmadigital.com/bf/creation-site-web-tarifs | abdi.bf/noms-de-domaine | firebase.google.com/pricing | developers.cloudflare.com/pages/platform/limits", "SmallFaso")]

    doc.build(story)
    print(OUT)


if __name__ == "__main__":
    build_pdf()
