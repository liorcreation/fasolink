#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de génération du Dossier de Présentation Commerciale et Technique FasoLink.
Conçu pour la présentation client, la cession/vente du projet et la finalisation sereine.
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    NextPageTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas

# Chemins de sortie
ROOT = Path(__file__).resolve().parents[1]
OUT_PDF_DIR = ROOT / "output" / "pdf"
OUT_PDF_DIR.mkdir(parents=True, exist_ok=True)
OUT_PDF_PATH = OUT_PDF_DIR / "fasolink-presentation-commerciale-client.pdf"

ARTIFACT_DIR = Path(r"C:\Users\Steve DIENDERE\.gemini\antigravity\brain\c1077010-286a-4e60-b497-7679d9dbb89d")

# Enregistrement des polices
def register_fonts():
    segoe_reg = r"C:\Windows\Fonts\segoeui.ttf"
    segoe_bold = r"C:\Windows\Fonts\segoeuib.ttf"
    segoe_italic = r"C:\Windows\Fonts\segoeuii.ttf"
    segoe_semibold = r"C:\Windows\Fonts\seguisb.ttf"
    
    if os.path.exists(segoe_reg) and os.path.exists(segoe_bold):
        pdfmetrics.registerFont(TTFont("FasoSans", segoe_reg))
        pdfmetrics.registerFont(TTFont("FasoSans-Bold", segoe_bold))
        if os.path.exists(segoe_italic):
            pdfmetrics.registerFont(TTFont("FasoSans-Italic", segoe_italic))
        else:
            pdfmetrics.registerFont(TTFont("FasoSans-Italic", segoe_reg))
        if os.path.exists(segoe_semibold):
            pdfmetrics.registerFont(TTFont("FasoSans-SemiBold", segoe_semibold))
        else:
            pdfmetrics.registerFont(TTFont("FasoSans-SemiBold", segoe_bold))
        return "FasoSans", "FasoSans-Bold", "FasoSans-Italic", "FasoSans-SemiBold"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-Bold"

REGULAR, BOLD, ITALIC, SEMIBOLD = register_fonts()

# Palette de couleurs FasoLink & Institutionnelle
COLOR_PRIMARY_NAVY = colors.HexColor("#0B132B")     # Bleu Nuit profond
COLOR_SECONDARY_DARK = colors.HexColor("#1C2541")   # Bleu Sombre élégant
COLOR_ACCENT_GREEN = colors.HexColor("#10B981")     # Vert FasoLink (Succès / Croissance)
COLOR_BURKINA_RED = colors.HexColor("#EF4444")      # Rouge dynamique Faso
COLOR_BURKINA_GOLD = colors.HexColor("#F59E0B")     # Or / Solaire
COLOR_BG_LIGHT = colors.HexColor("#F8FAFC")         # Fond blanc cassé / gris doux
COLOR_BORDER = colors.HexColor("#E2E8F0")           # Bordures douces
COLOR_TEXT_MAIN = colors.HexColor("#0F172A")        # Texte principal presque noir
COLOR_TEXT_MUTED = colors.HexColor("#475569")       # Texte secondaire ardoise
COLOR_TEXT_LIGHT = colors.HexColor("#94A3B8")       # Texte discret
COLOR_WHITE = colors.white
COLOR_CARD_BG = colors.HexColor("#FFFFFF")
COLOR_CARD_HIGHLIGHT = colors.HexColor("#F0FDF4")   # Vert pastel doux

# Styles Typographiques
base_styles = getSampleStyleSheet()

styles = {
    "CoverBadge": ParagraphStyle(
        name="CoverBadge", fontName=SEMIBOLD, fontSize=9, leading=12,
        textColor=COLOR_BURKINA_GOLD, alignment=TA_LEFT, spaceAfter=8
    ),
    "CoverTitle": ParagraphStyle(
        name="CoverTitle", fontName=BOLD, fontSize=32, leading=38,
        textColor=COLOR_WHITE, alignment=TA_LEFT, spaceAfter=10
    ),
    "CoverSubtitle": ParagraphStyle(
        name="CoverSubtitle", fontName=REGULAR, fontSize=13, leading=18,
        textColor=colors.HexColor("#CBD5E1"), alignment=TA_LEFT, spaceAfter=22
    ),
    "CoverDesc": ParagraphStyle(
        name="CoverDesc", fontName=REGULAR, fontSize=10, leading=15,
        textColor=colors.HexColor("#94A3B8"), alignment=TA_LEFT, spaceAfter=30
    ),
    "SectionKicker": ParagraphStyle(
        name="SectionKicker", fontName=BOLD, fontSize=8.5, leading=11,
        textColor=COLOR_BURKINA_GOLD, spaceAfter=4
    ),
    "SectionTitle": ParagraphStyle(
        name="SectionTitle", fontName=BOLD, fontSize=18, leading=22,
        textColor=COLOR_PRIMARY_NAVY, spaceAfter=6
    ),
    "SectionIntro": ParagraphStyle(
        name="SectionIntro", fontName=REGULAR, fontSize=9.5, leading=14,
        textColor=COLOR_TEXT_MUTED, spaceAfter=12
    ),
    "SubSectionTitle": ParagraphStyle(
        name="SubSectionTitle", fontName=BOLD, fontSize=11.5, leading=15,
        textColor=COLOR_SECONDARY_DARK, spaceBefore=8, spaceAfter=4
    ),
    "Body": ParagraphStyle(
        name="Body", fontName=REGULAR, fontSize=8.8, leading=12.5,
        textColor=COLOR_TEXT_MAIN, spaceAfter=5
    ),
    "BodyMuted": ParagraphStyle(
        name="BodyMuted", fontName=REGULAR, fontSize=8.2, leading=11.5,
        textColor=COLOR_TEXT_MUTED, spaceAfter=4
    ),
    "BulletText": ParagraphStyle(
        name="BulletText", fontName=REGULAR, fontSize=8.5, leading=12,
        textColor=COLOR_TEXT_MAIN, spaceAfter=3
    ),
    "TableHead": ParagraphStyle(
        name="TableHead", fontName=BOLD, fontSize=8, leading=10,
        textColor=COLOR_WHITE, alignment=TA_LEFT
    ),
    "TableCell": ParagraphStyle(
        name="TableCell", fontName=REGULAR, fontSize=7.8, leading=10.5,
        textColor=COLOR_TEXT_MAIN, alignment=TA_LEFT
    ),
    "TableCellBold": ParagraphStyle(
        name="TableCellBold", fontName=BOLD, fontSize=7.8, leading=10.5,
        textColor=COLOR_TEXT_MAIN, alignment=TA_LEFT
    ),
    "TableCellMuted": ParagraphStyle(
        name="TableCellMuted", fontName=REGULAR, fontSize=7.5, leading=10,
        textColor=COLOR_TEXT_MUTED, alignment=TA_LEFT
    ),
    "MetricNumber": ParagraphStyle(
        name="MetricNumber", fontName=BOLD, fontSize=16, leading=18,
        textColor=COLOR_PRIMARY_NAVY, alignment=TA_CENTER
    ),
    "MetricTitle": ParagraphStyle(
        name="MetricTitle", fontName=SEMIBOLD, fontSize=7.5, leading=9.5,
        textColor=COLOR_TEXT_MUTED, alignment=TA_CENTER
    ),
    "CalloutText": ParagraphStyle(
        name="CalloutText", fontName=REGULAR, fontSize=8.8, leading=12.5,
        textColor=COLOR_PRIMARY_NAVY
    ),
    "PitchBoxTitle": ParagraphStyle(
        name="PitchBoxTitle", fontName=BOLD, fontSize=9.5, leading=12,
        textColor=COLOR_PRIMARY_NAVY, spaceAfter=3
    ),
}

class NumberedCanvas(canvas.Canvas):
    """Canvas personnalisé pour numéroter les pages dynamiquement 'Page X sur Y' et ajouter en-tête / pied de page."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        # Ne rien dessiner sur la page de couverture (page 1)
        if self._pageNumber == 1:
            return

        self.saveState()
        w, h = A4

        # En-tête (Header)
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(16 * mm, h - 14 * mm, w - 16 * mm, h - 14 * mm)

        self.setFont(BOLD, 8)
        self.setFillColor(COLOR_PRIMARY_NAVY)
        self.drawString(16 * mm, h - 11 * mm, "FASOLINK MARKETPLACE")
        
        self.setFont(REGULAR, 7.5)
        self.setFillColor(COLOR_TEXT_MUTED)
        self.drawString(60 * mm, h - 11 * mm, "|   Dossier de Présentation & Cession Client")
        
        self.setFont(SEMIBOLD, 7.5)
        self.setFillColor(COLOR_BURKINA_GOLD)
        self.drawRightString(w - 16 * mm, h - 11 * mm, "CONFIDENTIEL CLIENT")

        # Pied de page (Footer)
        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(16 * mm, 14 * mm, w - 16 * mm, 14 * mm)

        self.setFont(REGULAR, 7.5)
        self.setFillColor(COLOR_TEXT_LIGHT)
        self.drawString(16 * mm, 9.5 * mm, "Plateforme B2B/B2C FasoLink  •  Déployée sur Cloudflare Workers & Firebase  •  Ouagadougou, Burkina Faso")
        
        page_str = f"Page {self._pageNumber} sur {total_pages}"
        self.drawRightString(w - 16 * mm, 9.5 * mm, page_str)

        self.restoreState()


def draw_cover_art(canvas_obj, doc):
    """Dessin de fond moderne et élégant pour la page de garde."""
    canvas_obj.saveState()
    w, h = A4

    # Fond bleu nuit
    canvas_obj.setFillColor(COLOR_PRIMARY_NAVY)
    canvas_obj.rect(0, 0, w, h, fill=1, stroke=0)

    # Motifs décoratifs géométriques (lignes & cercles élégants)
    canvas_obj.setFillColor(colors.HexColor("#1E293B"))
    canvas_obj.circle(w + 30 * mm, h + 30 * mm, 140 * mm, fill=1, stroke=0)

    # Cercle accent vert
    canvas_obj.setFillColor(colors.HexColor("#065F46"))
    canvas_obj.circle(w - 10 * mm, h - 35 * mm, 50 * mm, fill=1, stroke=0)

    # Disque accent or en bas à gauche
    canvas_obj.setFillColor(colors.HexColor("#92400E"))
    canvas_obj.circle(-20 * mm, 30 * mm, 60 * mm, fill=1, stroke=0)

    # Liseré aux couleurs du Burkina Faso
    band_height = 4 * mm
    canvas_obj.setFillColor(COLOR_BURKINA_RED)
    canvas_obj.rect(0, 0, w, band_height, fill=1, stroke=0)
    canvas_obj.setFillColor(COLOR_ACCENT_GREEN)
    canvas_obj.rect(w / 2, 0, w / 2, band_height, fill=1, stroke=0)
    
    # Étoile dorée symbolique
    canvas_obj.setFillColor(COLOR_BURKINA_GOLD)
    canvas_obj.circle(w / 2, band_height / 2, 3.5 * mm, fill=1, stroke=0)

    canvas_obj.restoreState()


def P(text, style_name="Body"):
    return Paragraph(text, styles[style_name])


def hr_divider(space_before=4, space_after=8, color=COLOR_BORDER):
    return HRFlowable(width="100%", thickness=0.6, color=color, spaceBefore=space_before, spaceAfter=space_after)


def section_header(kicker, title, intro=None):
    items = [
        P(kicker.upper(), "SectionKicker"),
        P(title, "SectionTitle"),
    ]
    if intro:
        items.append(P(intro, "SectionIntro"))
    items.append(hr_divider(2, 8, COLOR_BURKINA_GOLD))
    return items


def make_kpi_card(number, label, accent_color=COLOR_ACCENT_GREEN, width=41 * mm):
    return Table(
        [
            [Paragraph(number, ParagraphStyle(
                name=f"kpi_{number}", fontName=BOLD, fontSize=16, leading=19,
                textColor=accent_color, alignment=TA_CENTER
            ))],
            [P(label, "MetricTitle")]
        ],
        colWidths=[width],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), COLOR_CARD_BG),
            ("BOX", (0, 0), (-1, -1), 0.7, COLOR_BORDER),
            ("LINEABOVE", (0, 0), (-1, 0), 2.5, accent_color),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )


def make_callout(title, text, tone=COLOR_ACCENT_GREEN, width=178 * mm):
    bg_tone = COLOR_CARD_HIGHLIGHT if tone == COLOR_ACCENT_GREEN else colors.HexColor("#FEF3C7") if tone == COLOR_BURKINA_GOLD else colors.HexColor("#EFF6FF")
    hex_str = "#" + tone.hexval()[2:] if tone.hexval().startswith("0x") else tone.hexval()
    return Table(
        [
            [
                Paragraph(f"<b><font color='{hex_str}'>●</font> &nbsp; {title}</b>", styles["PitchBoxTitle"])
            ],
            [
                P(text, "CalloutText")
            ]
        ],
        colWidths=[width],
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg_tone),
            ("BOX", (0, 0), (-1, -1), 0.6, tone),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])
    )


def make_table(data, widths, header_color=COLOR_PRIMARY_NAVY, is_compact=False):
    v_pad = 4 if is_compact else 5
    h_pad = 6
    converted = []
    for r_idx, row in enumerate(data):
        row_cells = []
        for cell in row:
            if isinstance(cell, Paragraph) or isinstance(cell, Table):
                row_cells.append(cell)
            else:
                st = "TableHead" if r_idx == 0 else "TableCell"
                row_cells.append(P(str(cell), st))
        converted.append(row_cells)

    t = Table(converted, colWidths=widths, repeatRows=1)
    t_style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), h_pad),
        ("RIGHTPADDING", (0, 0), (-1, -1), h_pad),
        ("TOPPADDING", (0, 0), (-1, -1), v_pad),
        ("BOTTOMPADDING", (0, 0), (-1, -1), v_pad),
        ("GRID", (0, 0), (-1, -1), 0.35, COLOR_BORDER),
        ("BACKGROUND", (0, 0), (-1, 0), header_color),
    ]
    for r in range(1, len(data)):
        if r % 2 == 1:
            t_style.append(("BACKGROUND", (0, r), (-1, r), colors.HexColor("#FFFFFF")))
        else:
            t_style.append(("BACKGROUND", (0, r), (-1, r), colors.HexColor("#F8FAFC")))
    t.setStyle(TableStyle(t_style))
    return t


def build_story():
    story = []

    # =========================================================================
    # PAGE 1 : COUVERTURE OFFICIELLE & PRESTIGIEUSE
    # =========================================================================
    story.append(Spacer(1, 35 * mm))
    story.append(P("DOSSIER OFFICIEL DE PRÉSENTATION, VENTE & LIVRAISON", "CoverBadge"))
    story.append(P("FASOLINK", "CoverTitle"))
    story.append(P("La Plateforme Marketplace B2B/B2C de Référence au Burkina Faso", "CoverSubtitle"))
    story.append(hr_divider(4, 16, COLOR_BURKINA_GOLD))
    story.append(P(
        "Ce dossier stratégique et technique est destiné à la direction cliente et aux investisseurs. "
        "Il présente l'ensemble de la valeur ajoutée créée, l'inventaire exhaustif des fonctionnalités prêtes à l'emploi, "
        "l'architecture cloud ultra-performante et sécurisée, le modèle économique rentable et la feuille de route exacte "
        "permettant une mise en commercialisation immédiate et sereine.",
        "CoverDesc"
    ))

    # Tableau d'informations clés sur la couverture
    info_data = [
        [P("<b>Date d'émission</b>", "TableCellBold"), P(datetime.now().strftime("%d Octobre %Y"), "TableCell")],
        [P("<b>Version logicielle</b>", "TableCellBold"), P("v1.0.0 Pro-Grade (Release Clôturée & Durcie)", "TableCell")],
        [P("<b>Statut applicatif</b>", "TableCellBold"), P("Production Ready (Déployé sur Cloudflare Global Edge)", "TableCell")],
        [P("<b>URL officielle de test</b>", "TableCellBold"), P("<b>https://fasolink.jurisia-api.workers.dev</b>", "TableCellBold")],
        [P("<b>Périmètre couvert</b>", "TableCellBold"), P("Plateforme Web & PWA Mobile + Passerelle CinetPay + Super Admin", "TableCell")],
    ]
    info_table = Table(info_data, colWidths=[45 * mm, 125 * mm], style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1E293B")),
        ("TEXTCOLOR", (0, 0), (-1, -1), COLOR_WHITE),
        ("BOX", (0, 0), (-1, -1), 0.8, COLOR_BURKINA_GOLD),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#334155")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(info_table)
    story.append(NextPageTemplate("body_template"))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2 : VISION STRATÉGIQUE, OPPORTUNITÉ MARCHÉ & PROPOSITION DE VALEUR
    # =========================================================================
    story.extend(section_header(
        "01 • VISION & STRATÉGIE",
        "L'Opportunité Commerciale FasoLink au Burkina Faso",
        "Pourquoi FasoLink est conçu pour devenir l'acteur incontournable du commerce numérique local."
    ))

    # KPIs d'impact
    kpi_table = Table([[
        make_kpi_card("22M+", "Habitants ciblés au Burkina Faso", COLOR_BURKINA_GOLD),
        make_kpi_card("78%", "Pénétration Mobile Money (Orange/Moov)", COLOR_ACCENT_GREEN),
        make_kpi_card("< 1.2s", "Vitesse d'affichage sur smartphone", COLOR_BURKINA_RED),
        make_kpi_card("100%", "Autonomie de gestion du client", COLOR_PRIMARY_NAVY),
    ]], colWidths=[44 * mm] * 4, style=TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 1),
        ("RIGHTPADDING", (0, 0), (-1, -1), 1),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 8))

    story.append(P("<b>Le Problème Résolu :</b>", "SubSectionTitle"))
    story.append(P(
        "Au Burkina Faso, le commerce d'appareils électroniques (smartphones, ordinateurs, accessoires, électroménager) "
        "se fait encore massivement de manière informelle sur Facebook et WhatsApp. Les acheteurs souffrent du manque de confiance "
        "(arnaques, contrefaçons, absence de garantie) et d'un manque d'ergonomie pour comparer les prix. Les commerçants, quant à eux, "
        "n'ont aucun outil professionnel pour gérer leurs stocks, valoriser leur crédibilité et encaisser facilement.",
        "Body"
    ))

    story.append(P("<b>La Réponse Stratégique FasoLink :</b>", "SubSectionTitle"))
    story.append(P(
        "FasoLink crée un écosystème de confiance structuré en trois piliers :<br/>"
        "• <b>Pour les acheteurs :</b> Une vitrine moderne, ultra-rapide et géolocalisée (Ouagadougou, Bobo-Dioulasso, Koudougou...) pour dénicher des produits authentiques chez des commerçants vérifiés.<br/>"
        "• <b>Pour les vendeurs :</b> Un véritable progiciel de poche (Storefront digital, gestion de catalogue, badges KYC, QR Code boutique, contact direct WhatsApp et encaissement sécurisé).<br/>"
        "• <b>Pour l'acquéreur de FasoLink (Votre Entreprise) :</b> Un modèle d'affaires récurrent (SaaS B2B par abonnements mensuels/annuels) avec un coût d'infrastructure quasi nul et un contrôle total via un Super Admin surpuissant.",
        "Body"
    ))

    story.append(Spacer(1, 6))
    story.append(make_callout(
        "Argument Commercial Clé pour la Vente",
        "FasoLink n'est pas un simple site web, c'est un actif commercial complet 'clé en main'. L'acquéreur dispose "
        "d'un modèle rentable dès le premier mois grâce aux abonnements des commerçants, sans les tracas de gestion de stock direct "
        "puisque ce sont les marchands locaux qui approvisionnent la plateforme.",
        COLOR_ACCENT_GREEN
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3 : PARCOURS UTILISATEURS & MODULES FONCTIONNELS
    # =========================================================================
    story.extend(section_header(
        "02 • EXPÉRIENCE & FONCTIONNALITÉS",
        "Inventaire Complet des Fonctionnalités Développées",
        "Une suite logicielle complète intégrant l'expérience grand public, l'espace marchand et le centre d'administration."
    ))

    modules_data = [
        ["Module / Rôle", "Fonctionnalités Livrées & Validées", "Bénéfice Stratégique"],
        [
            P("<b>Acheteur / Visiteur</b><br/><font color='#475569'>Grand Public</font>", "TableCell"),
            P("• Recherche prédictive en temps réel par mot-clé, marque, modèle.<br/>"
              "• Filtres multicritères : Catégories spécialisées, prix, ville, quartier.<br/>"
              "• Fiches produits immersives avec galeries photos, état (neuf/occasion), fiche technique.<br/>"
              "• Fiches boutiques dédiées avec localisation, horaires, contacts et avis certifiés.<br/>"
              "• Bouton direct WhatsApp & Appel téléphonique pour conversion instantanée.<br/>"
              "• Gestion des Favoris persistants dans le compte acheteur.", "TableCell"),
            P("<b>Zéro friction :</b><br/>L'acheteur trouve et contacte le vendeur en 2 clics sur son smartphone.", "TableCellBold")
        ],
        [
            P("<b>Vendeur / Marchand</b><br/><font color='#475569'>Professionnel B2B</font>", "TableCell"),
            P("• Onboarding simplifié : Création de boutique avec nom, logo, bannière, spécialités.<br/>"
              "• Tableau de bord complet : Suivi des vues, clics de contact, produits phares.<br/>"
              "• Gestion de catalogue intuitif : Ajout/édition de produits, prix barrés, gestion des stocks.<br/>"
              "• QR Code boutique généré automatiquement à imprimer en magasin physique.<br/>"
              "• Vérification KYC : Téléversement CNIB / Passeport / Registre de commerce.<br/>"
              "• Paiement de l'abonnement par Mobile Money (Orange Money, Moov Money).", "TableCell"),
            P("<b>Professionnalisation :</b><br/>Le commerçant gagne une vitrine web sans aucune compétence technique.", "TableCellBold")
        ],
        [
            P("<b>Super Admin</b><br/><font color='#475569'>Gouvernance Propriétaire</font>", "TableCell"),
            P("• Pilotage global : Volume d'affaires, boutiques actives, produits en ligne.<br/>"
              "• Modération des boutiques : Validation, suspension en 1 clic ou réactivation.<br/>"
              "• Gestion KYC : Validation ou rejet des pièces d'identité des marchands.<br/>"
              "• Gestion des abonnements : Suivi des licences mensuelles, trimestrielles et annuelles.<br/>"
              "• Modération des avis clients anti-fraude et journal d'audit de sécurité.", "TableCell"),
            P("<b>Contrôle Total :</b><br/>Protection intégrale de la réputation et encaissement centralisé.", "TableCellBold")
        ],
        [
            P("<b>Application PWA</b><br/><font color='#475569'>Mobile & Offline</font>", "TableCell"),
            P("• Installable directement sur Android et iOS comme une application native sans passer par les stores.<br/>"
              "• Fonctionnement hors-ligne partiel avec Service Worker et mise en cache intelligente.<br/>"
              "• Consommation de données internet extrêmement optimisée pour le réseau local.", "TableCell"),
            P("<b>Accessibilité :</b><br/>Évite les coûts et délais de publication Play Store / App Store.", "TableCellBold")
        ]
    ]

    story.append(make_table(modules_data, [35 * mm, 105 * mm, 38 * mm], header_color=COLOR_PRIMARY_NAVY, is_compact=True))
    story.append(Spacer(1, 6))
    story.append(make_callout(
        "Spécialisation Sectorielle à Forte Marge",
        "La plateforme est actuellement optimisée sur la thématique la plus lucrative au Burkina Faso : "
        "<b>Téléphonie, Informatique, Audio, TV, Gaming, Accessoires et Électroménager</b>. L'architecture permet "
        "d'étendre à tout moment vers d'autres catégories (Mode, Automobile, Beauté) en modifiant un simple fichier de configuration.",
        COLOR_BURKINA_GOLD
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 4 : ARCHITECTURE TECHNIQUE & HAUTE PERFORMANCE
    # =========================================================================
    story.extend(section_header(
        "03 • INFRASTRUCTURE & PERFORMANCE",
        "Une Stack Technologique Ultra-Moderne & Économique",
        "Conçue pour supporter des dizaines de milliers d'utilisateurs sans coût serveur récurrent prohibitif."
    ))

    arch_data = [
        ["Composant", "Technologie Choisi", "Raison Stratégique & Avantage pour le Client"],
        [
            P("<b>Front-End & SSR</b>", "TableCellBold"),
            P("Next.js 16.3 + React 19 + TypeScript + Tailwind CSS", "TableCell"),
            P("Affichage instantané, référencement Google (SEO) optimal au Burkina Faso, code typé et sans bugs.", "TableCell")
        ],
        [
            P("<b>Hébergement Global</b>", "TableCellBold"),
            P("Cloudflare Workers (Edge Computing mondial)", "TableCell"),
            P("Déployé sur 300+ centres de données. Disponibilité 99.99%. <b>Coût d'hébergement quasi nul (plan gratuit à 5$/mois max)</b>.", "TableCell")
        ],
        [
            P("<b>Base de Données & Auth</b>", "TableCellBold"),
            P("Google Cloud Firebase (Firestore NoSQL + Auth)", "TableCell"),
            P("Temps réel, authentification sécurisée par token JWT, sauvegarde continue, scalabilité automatique de 10 à 500.000 utilisateurs.", "TableCell")
        ],
        [
            P("<b>Passerelle Mobile Money</b>", "TableCellBold"),
            P("CinetPay API v2 (Orange Money, Moov Money, Carte)", "TableCell"),
            P("Standard financier en Afrique de l'Ouest. Intégration par webhook sécurisé avec validation cryptographique HMAC.", "TableCell")
        ],
        [
            P("<b>Animations & UI</b>", "TableCellBold"),
            P("Framer Motion + Lucide Icons", "TableCell"),
            P("Expérience utilisateur fluide de niveau Silicon Valley, valorisant l'image de marque de la marketplace.", "TableCell")
        ]
    ]

    story.append(make_table(arch_data, [35 * mm, 55 * mm, 88 * mm], header_color=COLOR_SECONDARY_DARK, is_compact=False))
    story.append(Spacer(1, 10))

    story.append(P("<b>Avantages Économiques Majeurs de l'Architecture Serverless :</b>", "SubSectionTitle"))
    story.append(P(
        "Contrairement aux solutions traditionnelles sur serveurs dédiés coûteux (100 € à 300 € / mois chez OVH ou AWS) "
        "qui nécessitent un administrateur système en permanence, FasoLink utilise une architecture <b>Serverless</b> :<br/>"
        "• <b>Facturation à l'usage réel :</b> Si le trafic augmente, la plateforme encaisse la charge sans ralentissement.<br/>"
        "• <b>Zéro maintenance d'OS :</b> Aucune mise à jour Linux, aucun serveur à rebooter, aucune faille de système d'exploitation.<br/>"
        "• <b>Marge bénéficiaire maximale :</b> Les frais techniques mensuels pour l'acquéreur s'élèvent à moins de <b>10.000 FCFA / mois</b> même avec un trafic important, garantissant une rentabilité immédiate.",
        "Body"
    ))

    story.append(Spacer(1, 6))
    story.append(make_callout(
        "Certifié Déployé en Production",
        "L'application est d'ores et déjà compilée avec 0 erreur TypeScript et active en ligne sur le réseau mondial Cloudflare à l'adresse sécurisée HTTPS : <b>https://fasolink.jurisia-api.workers.dev</b>.",
        COLOR_ACCENT_GREEN
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 5 : AUDIT DE SÉCURITÉ & DURCISSEMENT PRO-GRADE
    # =========================================================================
    story.extend(section_header(
        "04 • CYBERSÉCURITÉ & AUDIT",
        "Durcissement Bancaire & Conformité des Données",
        "Une sécurité multicouche certifiée pour protéger les transactions financières et la propriété intellectuelle."
    ))

    sec_data = [
        ["Vecteur de Risque", "Mesure de Protection Implémentée dans FasoLink", "Statut Sécurité"],
        [
            P("<b>Fraude CinetPay / Webhook</b>", "TableCellBold"),
            P("Double-vérification cryptographique HMAC SHA-256 avec comparaison timing-safe + interrogation directe du serveur CinetPay 'check-status'.", "TableCell"),
            P("<b>100% BLINDÉ</b><br/><font color='#10B981'>Anti-usurpation</font>", "TableCellBold")
        ],
        [
            P("<b>Replay Attack / Double Crédit</b>", "TableCellBold"),
            P("Verrouillage transactionnel par idempotence Firestore. Une transaction CinetPay ne peut activer qu'un seul abonnement, même en cas de webhook renvoyé en boucle.", "TableCell"),
            P("<b>100% BLINDÉ</b><br/><font color='#10B981'>Anti-double débit</font>", "TableCellBold")
        ],
        [
            P("<b>Piratage Inter-Boutiques</b>", "TableCellBold"),
            P("Règles Firestore granulaires en modèle 'Zero Trust'. Un vendeur ne peut techniquement ni lire ni modifier les données d'une boutique concurrente.", "TableCell"),
            P("<b>100% ÉTANCHE</b><br/><font color='#10B981'>Isolation stricte</font>", "TableCellBold")
        ],
        [
            P("<b>Faux Avis Clients</b>", "TableCellBold"),
            P("Règle anti-fraude interdisant mathématiquement à un propriétaire de boutique de s'auto-évaluer ou de manipuler ses notes.", "TableCell"),
            P("<b>100% INTÈGRE</b><br/><font color='#10B981'>Anti-auto-notation</font>", "TableCellBold")
        ],
        [
            P("<b>Attaques Brute-Force & DDoS</b>", "TableCellBold"),
            P("Middleware Edge avec limitation de requêtes (Rate-Limiting) sur l'authentification (10 req/min) et les paiements (6 req/min).", "TableCell"),
            P("<b>PROTÉGÉ</b><br/><font color='#10B981'>Protection active</font>", "TableCellBold")
        ],
        [
            P("<b>Fuite de Secrets</b>", "TableCellBold"),
            P("Ségrégation stricte des clés privées. Aucune clé sensible Firebase Admin ou CinetPay Secret n'est exposée côté navigateur.", "TableCell"),
            P("<b>CONFORME</b><br/><font color='#10B981'>Secrets protégés</font>", "TableCellBold")
        ]
    ]

    story.append(make_table(sec_data, [40 * mm, 102 * mm, 36 * mm], header_color=COLOR_PRIMARY_NAVY, is_compact=True))
    story.append(Spacer(1, 8))

    story.append(P("<b>En-Têtes HTTP & Durcissement du Navigateur :</b>", "SubSectionTitle"))
    story.append(P(
        "Chaque requête servie par FasoLink intègre automatiquement les en-têtes de sécurité recommandés par l'ANSSI et l'OWASP : "
        "<code>Strict-Transport-Security (HSTS)</code>, <code>X-Content-Type-Options: nosniff</code>, <code>X-Frame-Options: DENY</code> (protection anti-clickjacking) "
        "et politique de référencement stricte. Vos utilisateurs naviguent dans un bunker numérique.",
        "Body"
    ))

    story.append(Spacer(1, 6))
    story.append(make_callout(
        "Conformité & Sérénité Juridique",
        "Ce niveau d'audit et de durcissement répond aux exigences des régulateurs financiers et des partenaires bancaires. "
        "L'acquéreur peut signer des partenariats avec Orange Money, Moov Africa et les banques locales en toute sérénité.",
        COLOR_ACCENT_GREEN
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 6 : MODÈLE ÉCONOMIQUE & PROJECTIONS DE RENTABILITÉ
    # =========================================================================
    story.extend(section_header(
        "05 • MODÈLE ÉCONOMIQUE & RENTABILITÉ",
        "Business Model & Génération de Chiffre d'Affaires",
        "Comment la plateforme génère des revenus récurrents et automatisés dès son lancement."
    ))

    # Tableau des abonnements configurés
    plans_data = [
        ["Formule", "Tarif Public", "Durée", "Avantages Inclus pour le Vendeur"],
        [
            P("<b>Essai Gratuit</b>", "TableCellBold"),
            P("<b>0 FCFA</b>", "TableCellBold"),
            P("14 Jours", "TableCell"),
            P("Accès complet à la boutique, publication jusqu'à 5 produits. Permet d'attirer et convaincre les commerçants sans résistance.", "TableCell")
        ],
        [
            P("<b>Pack Mensuel</b>", "TableCellBold"),
            P("<b>5 500 FCFA</b> / mois", "TableCellBold"),
            P("30 Jours", "TableCell"),
            P("Catalogue illimité, statistiques de contacts, lien WhatsApp direct, badge boutique certifiée, support client standard.", "TableCell")
        ],
        [
            P("<b>Pack Trimestriel</b>", "TableCellBold"),
            P("<b>13 500 FCFA</b> / trimestre", "TableCellBold"),
            P("90 Jours", "TableCell"),
            P("Économie de 3.000 FCFA pour le vendeur, mise en avant sur la page d'accueil, badge de confiance renforcé.", "TableCell")
        ],
        [
            P("<b>Pack Annuel</b>", "TableCellBold"),
            P("<b>48 000 FCFA</b> / an", "TableCellBold"),
            P("365 Jours", "TableCell"),
            P("Recommandé. Rentabilisé en 2 ventes. Visibilité prioritaire continue, QR code vitrine premium, assistance dédiée.", "TableCell")
        ]
    ]

    story.append(make_table(plans_data, [35 * mm, 38 * mm, 25 * mm, 80 * mm], header_color=COLOR_BURKINA_GOLD, is_compact=True))
    story.append(Spacer(1, 8))

    story.append(P("<b>Simulation Financière Prévisionnelle (Revenus Récurrents MRR) :</b>", "SubSectionTitle"))
    story.append(P(
        "Dans la seule ville de Ouagadougou et Bobo-Dioulasso, on dénombre plus de 3 000 commerces de téléphones et d'informatique. "
        "Voici les projections de chiffre d'affaires annuel selon le taux de pénétration :",
        "Body"
    ))

    sim_data = [
        ["Scénario", "Nombre de Boutiques", "Mix Moyen / Boutique", "Chiffre d'Affaires Mensuel", "Chiffre d'Affaires Annuel"],
        [
            P("<b>Phase 1 : Lancement</b>", "TableCellBold"),
            P("50 boutiques actives", "TableCell"),
            P("4 000 FCFA / mois", "TableCell"),
            P("<b>200 000 FCFA</b>", "TableCellBold"),
            P("<b>2 400 000 FCFA</b>", "TableCellBold")
        ],
        [
            P("<b>Phase 2 : Croissance</b>", "TableCellBold"),
            P("200 boutiques actives", "TableCell"),
            P("4 200 FCFA / mois", "TableCell"),
            P("<b>840 000 FCFA</b>", "TableCellBold"),
            P("<b>10 080 000 FCFA</b>", "TableCellBold")
        ],
        [
            P("<b>Phase 3 : Maturité</b>", "TableCellBold"),
            P("500 boutiques actives", "TableCell"),
            P("4 500 FCFA / mois", "TableCell"),
            P("<b>2 250 000 FCFA</b>", "TableCellBold"),
            P("<b>27 000 000 FCFA</b>", "TableCellBold")
        ],
    ]
    story.append(make_table(sim_data, [40 * mm, 35 * mm, 35 * mm, 34 * mm, 34 * mm], header_color=COLOR_SECONDARY_DARK, is_compact=True))
    story.append(Spacer(1, 6))

    story.append(make_callout(
        "Sources de Revenus Additionnelles Déjà Prévues",
        "1. <b>Mise en avant sponsorisée :</b> Facturation de bannières publicitaires en haut de l'accueil pour les grandes marques.<br/>"
        "2. <b>Commission sur vente optionnelle :</b> Prélèvement de 1% à 3% lors de l'intégration du paiement direct acheteur.<br/>"
        "3. <b>Services à valeur ajoutée :</b> Shooting photo professionnel des produits pour les boutiques de quartier.",
        COLOR_ACCENT_GREEN
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 7 : FEUILLE DE ROUTE & CHECKLIST DE CLÔTURE
    # =========================================================================
    story.extend(section_header(
        "06 • CHECKLIST & CLÔTURE",
        "Ce Qui Est Fait vs Ce Qui Reste pour le Lancement",
        "Une transparence absolue pour une passation de projet fluide, professionnelle et sans surprise."
    ))

    # Tableau comparatif Fait / Reste
    status_data = [
        ["Composant & Tâche", "Responsabilité", "Statut Actuel", "Action Requise pour l'Ouverture"],
        [
            P("<b>Développement Web & Mobile</b><br/>Next.js, 22 routes, PWA, filtres", "TableCell"),
            P("Équipe Technique", "TableCell"),
            P("<b>100% TERMINÉ</b><br/><font color='#10B981'>Validé</font>", "TableCellBold"),
            P("Aucune. Prêt à l'emploi.", "TableCellMuted")
        ],
        [
            P("<b>Durcissement Cybersécurité</b><br/>HMAC, Zero Trust, Rate Limiting", "TableCell"),
            P("Équipe Technique", "TableCell"),
            P("<b>100% TERMINÉ</b><br/><font color='#10B981'>Validé</font>", "TableCellBold"),
            P("Règles Firestore déployées.", "TableCellMuted")
        ],
        [
            P("<b>Intégration Passerelle CinetPay</b><br/>Code, Webhook, Idempotence", "TableCell"),
            P("Équipe Technique", "TableCell"),
            P("<b>100% INTÉGRÉ</b><br/><font color='#10B981'>Prêt production</font>", "TableCellBold"),
            P("Renseigner les clés marchandes réelles du client.", "TableCell")
        ],
        [
            P("<b>Compte Marchand CinetPay</b><br/>Contrat bancaire Mobile Money", "TableCell"),
            P("<b>Direction Cliente</b>", "TableCellBold"),
            P("<b>À finaliser</b><br/><font color='#F59E0B'>Administratif</font>", "TableCellBold"),
            P("Fournir RIB / IFU entreprise à CinetPay pour obtenir les clés API de production.", "TableCellBold")
        ],
        [
            P("<b>Nom de Domaine Personnalisé</b><br/>Ex: <i>fasolink.bf</i> ou <i>fasolink.com</i>", "TableCell"),
            P("<b>Direction Cliente</b>", "TableCellBold"),
            P("<b>À pointer</b><br/><font color='#F59E0B'>Configuration DNS</font>", "TableCellBold"),
            P("Acheter le domaine et ajouter les 2 enregistrements DNS Cloudflare fournis.", "TableCellBold")
        ],
        [
            P("<b>Création Compte Super Admin</b><br/>Identifiants propriétaire de la plateforme", "TableCell"),
            P("Conjoint (Tech + Client)", "TableCell"),
            P("<b>Script prêt</b><br/><font color='#10B981'>1 commande</font>", "TableCellBold"),
            P("Exécuter : <code>npm run superadmin:set client@mail.bf</code>.", "TableCell")
        ],
        [
            P("<b>Recette Finale & Validation (PV)</b><br/>101 scénarios de test documentés", "TableCell"),
            P("Direction Cliente", "TableCell"),
            P("<b>Guide rédigé</b><br/><font color='#10B981'>DOC_RECETTE</font>", "TableCellBold"),
            P("Tester le parcours vendeur et signer le PV de recette.", "TableCell")
        ]
    ]

    story.append(make_table(status_data, [45 * mm, 32 * mm, 30 * mm, 71 * mm], header_color=COLOR_PRIMARY_NAVY, is_compact=True))
    story.append(Spacer(1, 8))

    story.append(P("<b>Le Message Clé pour le Client :</b>", "SubSectionTitle"))
    story.append(P(
        "<b>Il n'y a plus aucun développement logiciel à faire.</b> Tout le code est écrit, testé et déployé. "
        "Les seules actions restantes relèvent exclusivement des formalités administratives et de propriété du client "
        "(son propre compte bancaire/CinetPay pour encaisser l'argent, son nom de domaine, et son mot de passe administrateur). "
        "Vous lui livrez une voiture neuve clé en main, il n'a plus qu'à insérer sa clé de contact.",
        "Body"
    ))

    story.append(Spacer(1, 6))
    story.append(make_callout(
        "Accompagnement Technique Garanti",
        "L'équipe technique prend en charge l'assistance lors du paramétrage des clés CinetPay finales et du pointage du nom de domaine. Cette passation s'effectue en moins de 48 heures.",
        COLOR_BURKINA_GOLD
    ))
    story.append(PageBreak())

    # =========================================================================
    # PAGE 8 : GUIDE D'ENTRETIEN COMMERCIAL & PROTOCOLE DE VENTE
    # =========================================================================
    story.extend(section_header(
        "07 • CONSEILS DE VENTE & CESSION",
        "Guide d'Entretien Commercial & Signature Sereine",
        "Comment structurer votre réunion de vente, lever les objections et conclure avec succès."
    ))

    story.append(P("<b>Structure Recommandée pour la Réunion de Présentation (45 min) :</b>", "SubSectionTitle"))
    
    pitch_steps = [
        ["Étape", "Timing", "Objectif & Déroulé"],
        [
            P("<b>1. L'Opportunité Marché</b>", "TableCellBold"),
            P("10 min", "TableCell"),
            P("Présenter la vision (Page 2 du dossier) : montrer le potentiel inexploité des commerces de téléphones à Ouaga et le modèle récurrent d'abonnements.", "TableCell")
        ],
        [
            P("<b>2. Démonstration Live</b>", "TableCellBold"),
            P("15 min", "TableCell"),
            P("Ouvrir <code>https://fasolink.jurisia-api.workers.dev</code> sur smartphone :<br/>"
              "• Montrer la fluidité de recherche d'un produit (ex: iPhone, ordinateur).<br/>"
              "• Créer une boutique en direct en 2 minutes (Espace Vendeur).<br/>"
              "• Ouvrir l'espace Super Admin et montrer le tableau de bord de contrôle.", "TableCell")
        ],
        [
            P("<b>3. Rassurance Technique & Sécurité</b>", "TableCellBold"),
            P("10 min", "TableCell"),
            P("Mettre en avant la robustesse (Cloudflare, CinetPay blindé HMAC, Zéro maintenance de serveur, PWA installable sans frais Google).", "TableCell")
        ],
        [
            P("<b>4. Clôture & Prochaines Étapes</b>", "TableCellBold"),
            P("10 min", "TableCell"),
            P("Montrer la checklist (Page 7) : <i>'Tout est prêt. Dès que vous nous transmettez vos accès CinetPay et votre domaine, la plateforme est en ligne sous votre nom.'</i>", "TableCell")
        ]
    ]
    story.append(make_table(pitch_steps, [40 * mm, 18 * mm, 120 * mm], header_color=COLOR_PRIMARY_NAVY, is_compact=True))
    story.append(Spacer(1, 8))

    story.append(P("<b>Réponses aux Objections Fréquentes du Client :</b>", "SubSectionTitle"))
    story.append(P(
        "• <b>Objection : 'Est-ce que ça va me coûter cher en serveurs chaque mois ?'</b><br/>"
        "  <b>Réponse :</b> <i>'Non, absolument pas. Grâce à l'architecture Cloudflare Serverless que nous avons conçue, vos coûts d'infrastructure sont de 0 FCFA au démarrage et ne dépasseront pas 5 000 à 10 000 FCFA/mois même avec des milliers de visiteurs.'</i><br/><br/>"
        "• <b>Objection : 'Comment je fais si un vendeur publie des contrefaçons ?'</b><br/>"
        "  <b>Réponse :</b> <i>'Vous avez le contrôle absolu depuis votre tableau de bord Super Admin. En un seul clic, vous pouvez suspendre sa boutique, masquer ses produits et bloquer ses accès.'</i><br/><br/>"
        "• <b>Objection : 'Pourquoi les marchands paieraient un abonnement ?'</b><br/>"
        "  <b>Réponse :</b> <i>'À 5 500 FCFA/mois, le coût est dérisoire pour un vendeur de smartphones : une seule vente supplémentaire réalisée grâce à la plateforme rembourse son abonnement pour toute l'année. De plus, les 14 jours d'essai gratuit permettent de les onboarder sans risque.'</i>",
        "Body"
    ))

    story.append(Spacer(1, 6))
    story.append(make_callout(
        "Conclusion : Un Projet Prêt à Générer de la Valeur",
        "FasoLink est un actif digital clé en main de haut niveau. Vous avez toutes les cartes en main pour conclure la vente avec une sérénité totale. Félicitations pour cette belle réalisation technique !",
        COLOR_ACCENT_GREEN
    ))

    return story


def generate_pdf():
    print(f"Génération du dossier PDF : {OUT_PDF_PATH}")
    doc = BaseDocTemplate(
        str(OUT_PDF_PATH),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
    )
    
    frame_normal = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    template_cover = PageTemplate(id="cover_template", frames=frame_normal, onPage=draw_cover_art)
    template_body = PageTemplate(id="body_template", frames=frame_normal)
    doc.addPageTemplates([template_cover, template_body])

    story = build_story()
    
    # Construction du document avec NumberedCanvas pour la numérotation automatique
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF généré avec succès dans :", OUT_PDF_PATH)

    # Copie dans le répertoire des artefacts pour mise à disposition directe dans le chat
    if ARTIFACT_DIR.exists():
        artifact_pdf_path = ARTIFACT_DIR / "fasolink-presentation-commerciale-client.pdf"
        shutil.copy2(OUT_PDF_PATH, artifact_pdf_path)
        print("PDF copié dans l'artifact directory :", artifact_pdf_path)


if __name__ == "__main__":
    generate_pdf()
