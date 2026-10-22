from io import BytesIO
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "output" / "pdf" / "fasolink-dossier-finalisation-commercialisation.pdf"

regular = Path(r"C:\Windows\Fonts\segoeui.ttf")
bold = Path(r"C:\Windows\Fonts\segoeuib.ttf")
if regular.exists() and bold.exists():
    pdfmetrics.registerFont(TTFont("FasoUpdate", str(regular)))
    pdfmetrics.registerFont(TTFont("FasoUpdateBold", str(bold)))
    FONT, BOLD = "FasoUpdate", "FasoUpdateBold"
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

styles = {
    "kicker": ParagraphStyle("kicker", fontName=BOLD, fontSize=8, leading=11, textColor=RED, spaceAfter=7),
    "title": ParagraphStyle("title", fontName=BOLD, fontSize=21, leading=26, textColor=INK, spaceAfter=8),
    "body": ParagraphStyle("body", fontName=FONT, fontSize=8.7, leading=12.5, textColor=MUTED, spaceAfter=6),
    "h2": ParagraphStyle("h2", fontName=BOLD, fontSize=11, leading=15, textColor=INK, spaceBefore=8, spaceAfter=5),
    "cell": ParagraphStyle("cell", fontName=FONT, fontSize=7.5, leading=10, textColor=INK),
    "head": ParagraphStyle("head", fontName=BOLD, fontSize=7.5, leading=10, textColor=WHITE),
    "callout": ParagraphStyle("callout", fontName=BOLD, fontSize=8.6, leading=12.5, textColor=INK),
}


def p(text, style="body"):
    return Paragraph(text, styles[style])


def paint(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(SAND)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.rect(0, A4[1] - 7 * mm, A4[0], 7 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(CLAY)
    canvas.line(18 * mm, 16 * mm, A4[0] - 18 * mm, 16 * mm)
    canvas.setFont(FONT, 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, "FasoLink | Dossier de finalisation commerciale")
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, "Mise a jour du 22 octobre 2026")
    canvas.restoreState()


def build_page():
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, leftMargin=19 * mm, rightMargin=19 * mm,
        topMargin=18 * mm, bottomMargin=22 * mm,
    )
    story = [
        p("MISE A JOUR PRODUIT | CATALOGUE ELECTRONIQUE", "kicker"),
        p("Comparer les offres, choisir en confiance", "title"),
        p("Les annonces electroniques disposent de fiches techniques structurees et d'un comparateur cote a cote. L'acheteur peut mieux evaluer plusieurs offres locales avant de contacter les vendeurs.") ,
        p("Ce qui a ete ajoute", "h2"),
    ]
    rows = [
        [p("Element", "head"), p("Dans l'espace vendeur", "head"), p("Cote acheteur", "head")],
        [p("Identification", "cell"), p("Marque et modele / reference, en champs distincts.", "cell"), p("Affiches sur la fiche produit et resumes sur les cartes du catalogue; recherche par marque et modele depuis l'accueil et le catalogue.", "cell")],
        [p("Etat du produit", "cell"), p("Choix optionnel : neuf, occasion ou reconditionne.", "cell"), p("Libelle visible pour mieux comprendre l'annonce.", "cell")],
        [p("Caracteristiques", "cell"), p("RAM, stockage et garantie annoncee; description libre conservee pour couleur, accessoires et autres details.", "cell"), p("Presentation claire en grille, adaptee au mobile.", "cell")],
        [p("Comparateur", "cell"), p("Aucun travail supplementaire pour le vendeur : il renseigne les informations sur sa fiche produit.", "cell"), p("Selection jusqu'a 3 appareils, comparaison du prix, boutique, ville, marque, modele, etat, RAM, stockage, disponibilite et garantie annoncee; acces direct a chaque offre.", "cell")],
        [p("Partage", "cell"), p("Aucune action requise apres publication de la fiche.", "cell"), p("Bouton de partage : ouvre le partage natif du telephone/navigateur ou copie le lien de l'annonce avec confirmation.", "cell")],
        [p("Recherche du catalogue", "cell"), p("Les informations produit restent optionnelles et les annonces existantes continuent de fonctionner.", "cell"), p("Filtre par marque et etat, filtre de disponibilite et de boutique, categories, recherche textuelle; tri recommande, prix croissant/decroissant ou nouveaute.", "cell")],
        [p("Outils vendeur", "cell"), p("Recherche nom/marque/modele, filtre par stock, tri par nom/prix/mise a jour et export CSV des prix, disponibilites et caracteristiques.", "cell"), p("L'export aide le vendeur a exploiter son inventaire; il ne modifie pas les offres publiques.", "cell")],
        [p("Mise a jour du stock", "cell"), p("Le vendeur change la disponibilite directement depuis la liste des produits. L'interface se met a jour sans rouvrir la fiche; elle annule le changement et affiche une erreur si l'enregistrement echoue.", "cell"), p("Le statut indique a l'acheteur est aligne sur la disponibilite enregistree.", "cell")],
        [p("Compatibilite", "cell"), p("Les champs sont facultatifs; les anciennes annonces restent valides.", "cell"), p("Les annonces existantes continuent de s'afficher sans migration obligatoire.", "cell")],
    ]
    table = Table(rows, colWidths=[31 * mm, 68 * mm, 62 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("GRID", (0, 0), (-1, -1), 0.4, CLAY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
    ]))
    story.extend([table, Spacer(1, 5 * mm), p("Securite et honnetete de l'information", "h2")])
    story.append(p("Les regles Firestore valident les champs permis, les formats et les longueurs, et empechent un vendeur de rattacher une fiche a une autre boutique. La garantie est presentee comme une declaration du vendeur, pas comme une garantie certifiee par FasoLink. Les caracteristiques doivent etre confirmees directement avec le commercant avant achat."))
    story.extend([p("Verifications techniques", "h2")])
    story.append(p("TypeScript, ESLint cible et build de production : passes. Les changements sont locaux, pas encore commites/pousses/deployes. Avant publication, tester les regles Firestore et faire une recette mobile/desktop des parcours acheteur et vendeur."))
    callout = Table([[p("Les prix, etats, disponibilites et garanties sont declares par les boutiques. Le comparateur facilite le choix mais FasoLink ne certifie pas ces informations; l'acheteur doit les confirmer aupres du vendeur. Il ne gere pas encore le paiement acheteur-vendeur, les commandes ou la livraison.", "callout")]], colWidths=[161 * mm])
    callout.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF1D6")),
        ("BOX", (0, 0), (-1, -1), 0.6, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story.extend([Spacer(1, 3 * mm), callout])
    doc.build(story, onFirstPage=paint)
    buffer.seek(0)
    return PdfReader(buffer).pages[0]


def build_release_page():
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, leftMargin=19 * mm, rightMargin=19 * mm,
        topMargin=18 * mm, bottomMargin=22 * mm,
    )
    story = [
        p("MISE A JOUR | SECURITE, FINANCES ET RECETTE", "kicker"),
        p("Pilotage financier & controles Firebase", "title"),
        p("Etat de travail au 22 octobre 2026. Cette page separe ce qui est implemente, ce qui a ete verifie localement et ce qui attend encore une vraie validation Firebase ou une decision du client."),
        p("Nouveau tableau de bord Super Admin", "h2"),
    ]
    rows = [
        [p("Vue", "head"), p("Ce qui est suivi", "head"), p("Regle de lecture", "head")],
        [p("Encaissements CinetPay", "cell"), p("Paiements avec passerelle CinetPay, montant positif et statut actif; total cumule et total des 30 derniers jours.", "cell"), p("Seuls les abonnements confirmes sont comptes comme encaisses.", "cell")],
        [p("Paiements en attente", "cell"), p("Nombre de transactions en attente et somme correspondante.", "cell"), p("Ce n'est pas du revenu acquis tant que le prestataire ne confirme pas le paiement.", "cell")],
        [p("Saisie manuelle", "cell"), p("Licences payantes attribuees directement par un Super Admin, affichees a part.", "cell"), p("Montant declare manuellement, a rapprocher d'une preuve externe; jamais additionne aux encaissements CinetPay.", "cell")],
        [p("Mouvements recents", "cell"), p("Dernieres licences, references, boutique, date, montant et statut; actualisation apres une action de licence.", "cell"), p("FasoLink ne gere pas encore les virements/retraits vers les vendeurs; aucun transfert fictif n'est affiche.", "cell")],
    ]
    table = Table(rows, colWidths=[32 * mm, 76 * mm, 53 * mm], repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("GRID", (0, 0), (-1, -1), 0.4, CLAY),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6), ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5), ("BACKGROUND", (0, 1), (-1, -1), WHITE),
    ]))
    story.extend([table, Spacer(1, 3 * mm), p("Regles et parcours renforces", "h2")])
    story.append(p("Les vendeurs ne peuvent plus modifier librement le statut de leur boutique ni incrementer eux-memes le compteur WhatsApp. Les contacts sont enregistres comme evenement immuable, une fois par visiteur et boutique. Une demande de verification doit maintenant etre validee champ par champ, provenir du proprietaire, et etre liee dans une seule ecriture atomique au passage du statut de verification a pending. Les regles Storage refusent les nouveaux televersements par un compte anonyme ou pour une boutique suspendue; elles limitent les images a moins de 5 Mo et gardent les pieces d'identite privees pour le proprietaire et le Super Admin."))
    story.extend([p("Etat des tests", "h2")])
    story.append(p("ESLint cible, TypeScript et build de production passent. npm audit --omit=dev ne releve aucune vulnerabilite de production; l'audit complet signale 28 alertes dans les dependances de developpement/transitives (12 moderees, 16 elevees). Une suite de tests Firestore + Storage est ajoutee, couvrant proprietaire, visiteur, ancien claim admin, Super Admin, creation de boutique, produits, avis, demandes de verification, contact WhatsApp, televersement logo et acces aux pieces privees. Les tests ne sont pas encore valides : l'emulateur s'arrete sur cette machine Windows avec une erreur de connexion loopback Java/Netty, meme avec le JDK 21 deja installe. Aucune regle n'est donc presentee comme testee avec succes sur l'emulateur ou en production."))
    story.extend([p("Ce qui attend encore le client ou Firebase", "h2")])
    remaining = [
        "Firebase Storage : le projet doit avoir un bucket reel et la facturation/le quota necessaires. Ce dossier ne confirme pas l'etat du compte, le quota ni l'activation; les essais locaux ne peuvent pas activer une offre payante.",
        "Paiement : le client doit confirmer le prestataire final et fournir/valider son compte marchand, les identifiants secrets et les notifications de paiement. Le tableau distingue les transactions CinetPay deja modelisees, mais le flux de production ne peut etre certifie sans secrets et paiement reel de test.",
        "Recette appareils : verifier les actions essentielles sur un vrai telephone iOS/Android, une tablette et un ordinateur; le controle de code et la compilation ne remplacent pas cette recette visuelle et fonctionnelle.",
        "Acceptation client : faire valider les textes juridiques, les comptes/claims Super Admin, les regles de moderation, les montants et le fonctionnement attendu avant la remise officielle.",
        "Publication : cette evolution est locale; les tests emulator bloquent la certification des regles. Ne pas annoncer une validation Firebase de production avant d'avoir execute la suite sans erreur puis effectue la recette et le deploiement autorise.",
    ]
    for item in remaining:
        story.append(p("- " + item))
    doc.build(story, onFirstPage=paint)
    buffer.seek(0)
    rendered = PdfReader(buffer).pages
    if len(rendered) != 1:
        raise ValueError(f"La page de mise a jour doit tenir sur une page, obtention: {len(rendered)}")
    return rendered[0]


if __name__ == "__main__":
    if not PDF.exists():
        raise FileNotFoundError(f"Dossier PDF existant introuvable: {PDF}")
    original = PdfReader(str(PDF))
    pages = list(original.pages)
    replaceable_titles = (
        "Des fiches produit plus utiles et plus fiables",
        "Comparer les offres, choisir en confiance",
        "Pilotage financier & controles Firebase",
    )
    while pages and any(title in (pages[-1].extract_text() or "") for title in replaceable_titles):
        pages.pop()
    writer = PdfWriter()
    for page in pages:
        writer.add_page(page)
    writer.add_page(build_page())
    writer.add_page(build_release_page())
    updated = PDF.with_name(PDF.stem + ".updated.pdf")
    with updated.open("wb") as output:
        writer.write(output)
    updated.replace(PDF)
    print(f"Mis a jour: {PDF} ({len(PdfReader(str(PDF)).pages)} pages)")
