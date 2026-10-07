import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Award, 
  Building, 
  User, 
  ShieldCheck,
  BookOpen,
  Bookmark,
  Scroll,
  Sparkles,
  QrCode,
  Compass,
  Crown,
  Gem,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { exportElementToPDF } from "@/lib/pdfExport";
import { useBranding } from "@/context/BrandingContext";

import motifPrestigeGold from "@/assets/images/motif_prestige_gold_1791278581572.jpg";
import motifEmeraldLuxury from "@/assets/images/motif_emerald_luxury_1791278592979.jpg";
import motifAzureModern from "@/assets/images/motif_azure_modern_1791278603841.jpg";
import motifBordeauxRoyal from "@/assets/images/motif_bordeaux_royal_1791278615620.jpg";

export type AttestationStyle = 
  | 'classic' 
  | 'prestige_gold' 
  | 'emerald_luxury' 
  | 'azure_modern' 
  | 'bordeaux_royal';

export interface AttestationModelOption {
  id: AttestationStyle;
  name: string;
  shortName: string;
  subtitle: string;
  isDefault?: boolean;
  motifImage?: string;
  accentColor: string;
  badgeClass: string;
}

export const ATTESTATION_MODELS: AttestationModelOption[] = [
  {
    id: 'classic',
    name: '1. Ancien Modèle (Par Défaut)',
    shortName: '1. Par Défaut (Ancien)',
    subtitle: 'Modèle Officiel MINEFOP Classique',
    isDefault: true,
    accentColor: '#0b2a63',
    badgeClass: 'bg-blue-600 text-white'
  },
  {
    id: 'prestige_gold',
    name: '2. Prestige Impérial (Motif Or & Marine)',
    shortName: '2. Prestige Or & Marine',
    subtitle: 'Motif Image Guilloché Or & Bleu Impérial',
    motifImage: motifPrestigeGold,
    accentColor: '#b38728',
    badgeClass: 'bg-amber-500 text-slate-950'
  },
  {
    id: 'emerald_luxury',
    name: '3. Émeraude Excellence (Motif Émeraude & Or)',
    shortName: '3. Émeraude & Or',
    subtitle: 'Motif Image Académique Émeraude & Or Brossé',
    motifImage: motifEmeraldLuxury,
    accentColor: '#047857',
    badgeClass: 'bg-emerald-600 text-white'
  },
  {
    id: 'azure_modern',
    name: '4. Cyber Azure (Motif Géométrique Bleu)',
    shortName: '4. Cyber Azure Moderne',
    subtitle: 'Motif Image Polygonal Saphir & Cyan',
    motifImage: motifAzureModern,
    accentColor: '#0284c7',
    badgeClass: 'bg-sky-500 text-white'
  },
  {
    id: 'bordeaux_royal',
    name: '5. Bordeaux Royal (Motif Cramoisi & Or)',
    shortName: '5. Bordeaux Royal',
    subtitle: 'Motif Image Universitaire Bordeaux & Champagne',
    motifImage: motifBordeauxRoyal,
    accentColor: '#991b1b',
    badgeClass: 'bg-rose-700 text-white'
  }
];

export interface AttestationData {
  id?: string;
  docNumber?: string;
  category: 'stage' | 'formation';
  styleModel?: AttestationStyle;
  studentId?: string;
  studentName: string;
  studentMatricule?: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: string;
  specialty?: string;
  promo?: string;
  sessionPeriod?: string;
  mention?: string;
  overallAverage?: string;
  companyName?: string;
  companySupervisor?: string;
  internshipTopic?: string;
  issueDate?: string;
  issueCity?: string;
  directorName?: string;
  status?: string;
}

export interface OfficialAttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  attestation: AttestationData | null;
}

const ATTESTATION_SCOPED_CSS = `
  .itmc-attestation-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 12px 0;
    transition: transform 0.2s ease;
  }

  /* BASE ATTESTATION PAGE (A4 Landscape: 297mm x 210mm) */
  .itmc-attestation-page {
    --navy-dark: #0a1e3f;
    --navy: #0b2a63;
    --gold: #c59b27;
    --gold-dark: #a47b19;
    --gold-light: #fbf6e8;
    --gold-foil: linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%);
    --blue: #2f6fd0;
    --red: #d4202c;
    --ink: #111827;
    --muted: #4b5563;
    --border-color: #e5e7eb;
    --theme-primary: #0b2a63;
    --theme-secondary: #c59b27;
    --theme-light: #f8fafc;
    
    position: relative;
    width: 297mm;
    min-width: 297mm;
    height: 210mm;
    min-height: 210mm;
    margin: 0 auto;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.35);
    box-sizing: border-box;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    overflow: hidden;
    padding: 12mm 16mm;
    background: #ffffff;
  }

  .itmc-attestation-page * {
    box-sizing: border-box;
  }

  /* COLOR WATERMARK */
  .itmc-attestation-page .watermark-bg {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 3;
    overflow: hidden;
  }
  .itmc-attestation-page .watermark-img {
    width: 124mm;
    max-width: 62%;
    height: auto;
    object-fit: contain;
    opacity: 0.18;
    filter: saturate(150%) contrast(110%) brightness(0.96);
    user-select: none;
  }

  .itmc-attestation-page .page-content {
    position: relative;
    z-index: 5;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  /* ==============================================================
     MODÈLE 1 (PAR DÉFAUT) : ANCIEN MODÈLE OFFICIEL (STAGE & FORMATION)
     ============================================================== */
  .style-classic.stage-theme {
    background: #ffffff;
    --theme-primary: #0b2a63;
    --theme-secondary: #c59b27;
  }
  .style-classic.formation-theme {
    background: linear-gradient(135deg, #ffffff 0%, #fdfbf7 50%, #fbf8f0 100%);
    --theme-primary: #0b2a63;
    --theme-secondary: #b38728;
  }
  .style-classic .frame-border {
    position: absolute;
    inset: 5mm;
    border: 1.5mm double var(--navy);
    pointer-events: none;
    z-index: 2;
  }
  .style-classic.formation-theme .frame-border {
    border: 1.5mm double #b38728;
    box-shadow: inset 0 0 0 1mm #ffffff, inset 0 0 0 1.4mm #0b2a63;
  }
  .style-classic .frame-inner-border {
    position: absolute;
    inset: 8mm;
    border: 0.4mm solid var(--gold);
    pointer-events: none;
    z-index: 2;
  }
  .style-classic .corner {
    position: absolute;
    width: 15mm;
    height: 15mm;
    pointer-events: none;
    z-index: 3;
    border-color: var(--gold);
    border-style: solid;
  }
  .style-classic .c-tl { top: 6.5mm; left: 6.5mm; border-width: 1mm 0 0 1mm; }
  .style-classic .c-tr { top: 6.5mm; right: 6.5mm; border-width: 1mm 1mm 0 0; }
  .style-classic .c-bl { bottom: 6.5mm; left: 6.5mm; border-width: 0 0 1mm 1mm; }
  .style-classic .c-br { bottom: 6.5mm; right: 6.5mm; border-width: 0 1mm 1mm 0; }

  .style-classic .corner-guilloche-svg {
    position: absolute;
    width: 24mm;
    height: 24mm;
    pointer-events: none;
    z-index: 3;
  }
  .style-classic .cg-tl { top: 5.5mm; left: 5.5mm; }
  .style-classic .cg-tr { top: 5.5mm; right: 5.5mm; transform: scaleX(-1); }
  .style-classic .cg-bl { bottom: 5.5mm; left: 5.5mm; transform: scaleY(-1); }
  .style-classic .cg-br { bottom: 5.5mm; right: 5.5mm; transform: scale(-1); }

  /* RESTORED DEFAULT TITLE BANNER & DOC BADGE */
  .itmc-attestation-page .title-banner {
    text-align: center;
    margin: 1.5mm 0;
    position: relative;
  }
  .itmc-attestation-page .title-text {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 6.8mm;
    font-weight: 900;
    color: var(--navy-dark);
    letter-spacing: 0.5mm;
    text-transform: uppercase;
    margin: 0;
    line-height: 1.15;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
  }
  .style-classic.formation-theme .title-text {
    font-family: "Cinzel", "Georgia", serif;
    color: #0b2a63;
    border-bottom: 0.5mm solid #d4af37;
    display: inline-block;
    padding-bottom: 0.8mm;
  }
  .itmc-attestation-page .doc-num-badge {
    display: inline-flex;
    align-items: center;
    gap: 1.5mm;
    background: var(--gold-light);
    color: var(--navy);
    border: 0.35mm solid var(--gold);
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 2.6mm;
    font-weight: 800;
    padding: 0.7mm 4.5mm;
    border-radius: 4mm;
    margin-top: 1.2mm;
    letter-spacing: 0.2mm;
  }
  .style-classic.formation-theme .doc-num-badge {
    background: #0b2a63;
    color: #fcf6ba;
    border: 0.4mm solid #b38728;
  }

  /* ==============================================================
     LES 4 NOUVEAUX MODÈLES AVEC MOTIFS MODERNES EN IMAGE
     ============================================================== */
  .itmc-attestation-page.has-image-motif {
    padding: 15mm 20mm;
  }

  .itmc-attestation-page .motif-bg-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  }

  .itmc-attestation-page .motif-bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: fill;
    user-select: none;
  }

  /* Sanctuary veil keeps the outer 14mm-18mm image border 100% vivid while ensuring crystal-clear text in the center */
  .itmc-attestation-page .motif-inner-sanctuary {
    position: absolute;
    inset: 12.5mm 16.5mm;
    border-radius: 3.5mm;
    background: radial-gradient(
      ellipse at center,
      rgba(255, 255, 255, 0.96) 64%,
      rgba(255, 255, 255, 0.90) 86%,
      rgba(255, 255, 255, 0.65) 100%
    );
    box-shadow: 0 0 18px rgba(255, 255, 255, 0.9);
    z-index: 2;
  }

  .itmc-attestation-page .motif-inner-frame {
    position: absolute;
    inset: 12.5mm 16.5mm;
    border-radius: 3.5mm;
    border: 0.5mm solid var(--theme-secondary);
    box-shadow: inset 0 0 0 1mm rgba(255, 255, 255, 0.8), inset 0 0 0 1.3mm var(--theme-primary);
    pointer-events: none;
    z-index: 3;
  }

  /* Image Motif Ribbon Strip inside Title & Card */
  .itmc-attestation-page .motif-title-wrapper {
    text-align: center;
    margin: 1.5mm 0;
    position: relative;
  }

  .itmc-attestation-page .motif-title-heading {
    font-family: "Cinzel", "Georgia", serif;
    font-size: 6.7mm;
    font-weight: 900;
    color: var(--theme-primary);
    letter-spacing: 0.55mm;
    text-transform: uppercase;
    margin: 0;
    line-height: 1.15;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.08));
  }

  .itmc-attestation-page .motif-doc-badge {
    display: inline-flex;
    align-items: center;
    gap: 1.8mm;
    background: var(--theme-primary);
    color: #ffffff;
    border: 0.4mm solid var(--theme-secondary);
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 2.55mm;
    font-weight: 800;
    padding: 0.7mm 4.5mm;
    border-radius: 4mm;
    margin-top: 1.2mm;
    letter-spacing: 0.25mm;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  }

  .itmc-attestation-page .motif-student-card {
    background: rgba(255, 255, 255, 0.95);
    border: 0.45mm solid var(--theme-secondary);
    border-radius: 4mm;
    padding: 3.5mm 5.5mm 2.8mm;
    margin: 2mm auto;
    max-width: 228mm;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
  }

  .itmc-attestation-page .motif-card-top-strip {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1.8mm;
    overflow: hidden;
    border-bottom: 0.25mm solid var(--theme-secondary);
  }

  .itmc-attestation-page .motif-card-top-strip img {
    width: 100%;
    height: 25mm;
    object-fit: cover;
    object-position: top center;
    filter: contrast(115%) saturate(120%);
  }

  /* THEME VARIABLES FOR EACH OF THE 4 NEW IMAGE MODELS */
  .style-prestige_gold {
    --theme-primary: #0a1e3f;
    --theme-secondary: #c59b27;
    --theme-light: #fdfbf7;
  }

  .style-emerald_luxury {
    --theme-primary: #064e3b;
    --theme-secondary: #d97706;
    --theme-light: #f0fdf4;
  }
  .style-emerald_luxury .header-left strong,
  .style-emerald_luxury .header-right strong,
  .style-emerald_luxury .center-title,
  .style-emerald_luxury .student-highlight-name,
  .style-emerald_luxury .details-item b,
  .style-emerald_luxury .diploma-val,
  .style-emerald_luxury .sig-box .title {
    color: #064e3b;
  }
  .style-emerald_luxury .center-logo-box {
    border-color: #064e3b;
  }
  .style-emerald_luxury .header-grid {
    border-bottom-color: #059669;
  }

  .style-azure_modern {
    --theme-primary: #0f172a;
    --theme-secondary: #0284c7;
    --theme-light: #f0f9ff;
  }
  .style-azure_modern .motif-title-heading {
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    letter-spacing: 0.45mm;
    color: #0f172a;
  }
  .style-azure_modern .header-left strong,
  .style-azure_modern .header-right strong,
  .style-azure_modern .center-title,
  .style-azure_modern .student-highlight-name,
  .style-azure_modern .details-item b,
  .style-azure_modern .diploma-val,
  .style-azure_modern .sig-box .title {
    color: #0f172a;
  }
  .style-azure_modern .header-grid {
    border-bottom-color: #0284c7;
  }
  .style-azure_modern .student-highlight-name {
    border-bottom-color: #0284c7;
  }

  .style-bordeaux_royal {
    --theme-primary: #7f1d1d;
    --theme-secondary: #b38728;
    --theme-light: #fff1f2;
  }
  .style-bordeaux_royal .header-left strong,
  .style-bordeaux_royal .header-right strong,
  .style-bordeaux_royal .center-title,
  .style-bordeaux_royal .student-highlight-name,
  .style-bordeaux_royal .details-item b,
  .style-bordeaux_royal .diploma-val,
  .style-bordeaux_royal .sig-box .title {
    color: #7f1d1d;
  }
  .style-bordeaux_royal .center-logo-box {
    border-color: #7f1d1d;
  }
  .style-bordeaux_royal .header-grid {
    border-bottom-color: #b38728;
  }

  /* SHARED HEADER & FOOTER ELEMENTS FOR ALL STYLES */
  .itmc-attestation-page .header-grid {
    display: grid;
    grid-template-columns: 82mm 1fr 82mm;
    gap: 2mm;
    align-items: center;
    border-bottom: 0.4mm solid var(--gold);
    padding-bottom: 2mm;
  }
  .itmc-attestation-page .header-left, .itmc-attestation-page .header-right {
    text-align: center;
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 2.3mm;
    line-height: 1.25;
    color: var(--muted);
  }
  .itmc-attestation-page .header-left strong, .itmc-attestation-page .header-right strong {
    color: var(--navy);
    font-size: 2.55mm;
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.15mm;
  }
  .itmc-attestation-page .header-center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.7mm;
  }
  .itmc-attestation-page .center-logo-box {
    width: 14.5mm;
    height: 14.5mm;
    border-radius: 50%;
    border: 0.8mm solid var(--navy);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    overflow: hidden;
  }
  .itmc-attestation-page .center-logo-box img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .itmc-attestation-page .center-title {
    font-size: 3.4mm;
    font-weight: 900;
    color: var(--navy);
    letter-spacing: 0.2mm;
    line-height: 1;
    text-transform: uppercase;
  }
  .itmc-attestation-page .center-accred {
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 1.9mm;
    color: var(--muted);
    font-weight: 700;
  }

  /* BODY TEXT & DETAILS GRID */
  .itmc-attestation-page .body-text-box {
    text-align: center;
    font-family: "Georgia", serif;
    font-size: 3.5mm;
    line-height: 1.5;
    color: var(--ink);
    padding: 0 4mm;
  }
  .itmc-attestation-page .director-preamble {
    font-style: italic;
    color: var(--muted);
    font-size: 3.2mm;
    margin-bottom: 1mm;
  }
  .itmc-attestation-page .student-highlight-name {
    font-family: "Georgia", serif;
    font-size: 5.6mm;
    font-weight: 900;
    color: var(--navy);
    letter-spacing: 0.4mm;
    text-transform: uppercase;
    display: inline-block;
    padding: 0.4mm 5mm;
    border-bottom: 0.5mm solid var(--gold);
    margin: 0.8mm 0;
  }

  .itmc-attestation-page .details-grid-container {
    background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
    border: 0.35mm solid var(--navy);
    border-top: 1mm solid var(--navy);
    border-radius: 4mm;
    padding: 2.8mm 5mm;
    margin: 1.8mm auto;
    max-width: 225mm;
    box-shadow: 0 2px 8px rgba(11, 42, 99, 0.05);
  }
  .itmc-attestation-page .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.6mm 6mm;
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 2.75mm;
    text-align: left;
  }
  .itmc-attestation-page .details-item {
    display: flex;
    align-items: flex-start;
    gap: 1.5mm;
  }
  .itmc-attestation-page .details-item b {
    color: var(--navy);
    font-weight: 800;
    flex-shrink: 0;
  }
  .itmc-attestation-page .details-item span {
    color: var(--ink);
  }

  /* DIPLOMA BOX LANDSCAPE */
  .itmc-attestation-page .details-diploma-box-landscape {
    background: #ffffff;
    border: 0.35mm solid var(--navy);
    border-top: 1mm solid var(--gold-dark);
    border-radius: 3.5mm;
    padding: 2.5mm 4mm;
    margin: 1.8mm auto;
    max-width: 228mm;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .itmc-attestation-page .details-diploma-grid-landscape {
    display: grid;
    gap: 1.6mm 4mm;
    text-align: left;
    font-family: "Segoe UI", Arial, sans-serif;
  }
  .itmc-attestation-page .diploma-row-landscape {
    background: #f8fafc;
    border: 0.25mm solid #e2e8f0;
    border-radius: 2mm;
    padding: 1.4mm 3mm;
  }
  .itmc-attestation-page .diploma-label {
    font-size: 2.05mm;
    font-weight: 800;
    color: var(--muted);
    text-transform: uppercase;
    display: block;
  }
  .itmc-attestation-page .diploma-val {
    font-size: 2.75mm;
    font-weight: 900;
    color: var(--navy);
    display: block;
  }
  .itmc-attestation-page .diploma-val.highlight {
    color: var(--blue);
  }

  /* FOOTER SIGNATURES & STAMPS */
  .itmc-attestation-page .footer-signatures {
    display: grid;
    grid-template-columns: 78mm 1fr 78mm;
    gap: 2mm;
    align-items: flex-end;
    margin-top: 0.5mm;
  }
  .itmc-attestation-page .sig-box {
    text-align: center;
    font-family: "Segoe UI", Arial, sans-serif;
    font-size: 2.65mm;
  }
  .itmc-attestation-page .sig-box .title {
    font-weight: 800;
    color: var(--navy);
    text-transform: uppercase;
    letter-spacing: 0.1mm;
    margin-bottom: 7.5mm;
  }
  .itmc-attestation-page .sig-box .name {
    font-weight: 900;
    color: var(--ink);
    border-top: 0.3mm dashed var(--muted);
    padding-top: 0.8mm;
    display: inline-block;
    min-width: 45mm;
  }
  .itmc-attestation-page .center-seal {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.8mm;
  }
  .itmc-attestation-page .seal-circle {
    width: 19.5mm;
    height: 19.5mm;
    border-radius: 50%;
    border: 0.6mm dashed var(--gold-dark);
    background: var(--gold-light);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1.75mm;
    font-weight: 800;
    color: var(--navy);
    line-height: 1;
    box-shadow: inset 0 0 5px rgba(197, 155, 39, 0.3);
  }

  /* FORMATION & PRESTIGE GOLD SEAL WITH RIBBONS */
  .itmc-attestation-page .gold-seal-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .itmc-attestation-page .gold-academic-seal {
    width: 21mm;
    height: 21mm;
    border-radius: 50%;
    background: var(--gold-foil);
    padding: 0.8mm;
    box-shadow: 0 4px 10px rgba(197, 155, 39, 0.4);
    z-index: 2;
  }
  .itmc-attestation-page .gold-seal-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 0.4mm dashed #ffffff;
    background: var(--theme-primary, #0b2a63);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fcf6ba;
    font-family: "Segoe UI", Arial, sans-serif;
    text-align: center;
    line-height: 1.1;
  }
  .itmc-attestation-page .gold-seal-inner .seal-inst {
    font-size: 1.9mm;
    font-weight: 900;
  }
  .itmc-attestation-page .gold-seal-inner .seal-center {
    font-size: 2.3mm;
    font-weight: 900;
    color: #ffffff;
  }
  .itmc-attestation-page .gold-seal-inner .seal-motto {
    font-size: 1.1mm;
    letter-spacing: 0.15mm;
  }
  .itmc-attestation-page .gold-seal-ribbons {
    position: absolute;
    top: 10.5mm;
    display: flex;
    gap: 0.8mm;
    z-index: 1;
    transform: rotate(-8deg);
  }
  .itmc-attestation-page .seal-ribbon {
    width: 2.8mm;
    height: 9.5mm;
    background: linear-gradient(to right, #b91c1c, #dc2626, #991b1b);
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%);
    box-shadow: 0 1.5px 3px rgba(0,0,0,0.25);
  }
  .itmc-attestation-page .seal-ribbon-second {
    transform: rotate(12deg);
    opacity: 0.9;
  }
`;

// Helper component for SVG Guilloche Corner Motif (used in Default Formation model)
function GuillocheCornerSVG({ className }: { className?: string }) {
  return (
    <svg className={cn("corner-guilloche-svg", className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 10 L90 10 M10 10 L10 90" stroke="#b38728" strokeWidth="3" />
      <path d="M15 15 L80 15 M15 15 L15 80" stroke="#d4af37" strokeWidth="1" />
      <circle cx="25" cy="25" r="10" stroke="#b38728" strokeWidth="1.5" fill="none" />
      <circle cx="25" cy="25" r="6" stroke="#fcf6ba" strokeWidth="1" fill="#0b2a63" />
      <path d="M25 15 L25 35 M15 25 L35 25" stroke="#fcf6ba" strokeWidth="1" />
      <path d="M35 10 C50 30, 30 50, 10 35" stroke="#b38728" strokeWidth="1" fill="none" />
      <path d="M50 10 C70 40, 40 70, 10 50" stroke="#d4af37" strokeWidth="1" fill="none" />
    </svg>
  );
}

export function OfficialAttestationModal({ isOpen, onClose, attestation }: OfficialAttestationModalProps) {
  const { branding } = useBranding();
  const [zoomScale, setZoomScale] = useState<number>(0.78);
  // Default is ALWAYS 'classic' (the restored original model) unless attestation specifies another model
  const [selectedStyle, setSelectedStyle] = useState<AttestationStyle>('classic');
  const [isDownloading, setIsDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (attestation) {
      setSelectedStyle(attestation.styleModel || 'classic');
    }
  }, [attestation]);

  if (!attestation) return null;

  const isStage = attestation.category === 'stage';
  const docTitle = isStage
    ? "ATTESTATION DE FIN DE STAGE PRATIQUE"
    : "ATTESTATION DE FIN DE FORMATION PROFESSIONNELLE";
  const fileName = `Attestation_${attestation.category}_${selectedStyle}_${attestation.studentName.replace(/\s+/g, '_')}`;

  const currentModelObj = ATTESTATION_MODELS.find(m => m.id === selectedStyle) || ATTESTATION_MODELS[0];
  const isImageMotifModel = selectedStyle !== 'classic' && Boolean(currentModelObj.motifImage);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await exportElementToPDF(certRef.current, fileName, { scale: 3.0, landscape: true });
      toast.success("Document PDF exporté avec succès !");
    } catch (e) {
      toast.error("Erreur lors de la génération du PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[99vw] max-w-[330mm] h-[96vh] rounded-3xl border border-slate-800 p-0 overflow-hidden bg-slate-950 shadow-2xl flex flex-col my-auto">
        <style>{ATTESTATION_SCOPED_CSS}</style>

        {/* Top Control Bar with 5 Models (1 Default Restored + 4 New Modern Image Motif Models) */}
        <div className="bg-slate-900/95 px-5 py-3 border-b border-slate-800 flex flex-col gap-2.5 text-white shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">
                {isStage ? <Building className="w-5 h-5" /> : <Award className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>{docTitle}</span>
                  <Badge className={cn("font-black text-[9px] uppercase", isStage ? "bg-blue-600 text-blue-50" : "bg-amber-500 text-amber-950")}>
                    {isStage ? "A4 Paysage • Stage" : "A4 Paysage • Formation"}
                  </Badge>
                </h3>
                <p className="text-[11px] text-slate-400 font-bold">
                  {attestation.studentName} • N° {attestation.docNumber || 'Officiel'} • Modèle actif : <span className="text-amber-300">{currentModelObj.name}</span>
                </p>
              </div>
            </div>

            {/* Actions: Zoom, Download & Print */}
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoomScale(prev => Math.max(0.3, Number((prev - 0.05).toFixed(2))))}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <button onClick={() => setZoomScale(0.78)} className="text-[10px] font-bold px-1.5 text-slate-300 hover:text-white">
                  {Math.round(zoomScale * 100)}%
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setZoomScale(prev => Math.min(1.2, Number((prev + 0.05).toFixed(2))))}
                  className="h-7 w-7 p-0 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>

              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-9 px-3.5 gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? "PDF..." : "Télécharger PDF"}
              </Button>

              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl h-9 px-3 gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-9 w-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 5 Graphic Models Switcher Bar with Image Motif Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              Modèles ({ATTESTATION_MODELS.length}) :
            </span>
            {ATTESTATION_MODELS.map((model) => {
              const isSelected = selectedStyle === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedStyle(model.id)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 border",
                    isSelected
                      ? cn(model.badgeClass, "border-white/30 shadow-md scale-[1.01]")
                      : "bg-slate-950/90 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white"
                  )}
                >
                  {model.motifImage ? (
                    <span className="w-7 h-5 rounded-md overflow-hidden border border-white/30 shrink-0 bg-white block">
                      <img
                        src={model.motifImage}
                        alt={model.shortName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </span>
                  ) : (
                    <span className="w-6 h-5 rounded-md bg-blue-950 border border-amber-400/60 flex items-center justify-center shrink-0">
                      <Scroll className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  )}
                  <div className="text-left leading-tight">
                    <div className="text-[11px] font-black flex items-center gap-1">
                      <span>{model.shortName}</span>
                      {model.isDefault && (
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.2 rounded-full uppercase font-black",
                          isSelected ? "bg-white/25 text-white" : "bg-blue-500/20 text-blue-300"
                        )}>
                          Défaut
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main View - Scrollable Canvas */}
        <div className="overflow-auto custom-scrollbar p-6 bg-[#1e293b] flex-1 flex flex-col items-center justify-start min-h-0 w-full">
          <div className="itmc-attestation-wrap" style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}>
            
            {/* ==============================================================
               A4 LANDSCAPE SHEET (STAGE OR FORMATION) WITH SELECTED MODEL
               ============================================================== */}
            <div 
              ref={certRef} 
              className={cn(
                "itmc-attestation-page", 
                isStage ? "stage-theme" : "formation-theme",
                `style-${selectedStyle}`,
                isImageMotifModel && "has-image-motif"
              )}
            >
              
              {/* ==============================================================
                 MODÈLE 1 (PAR DÉFAUT) : ANCIEN MODÈLE OFFICIEL RESTAURÉ
                 ============================================================== */}
              {selectedStyle === 'classic' && (
                <>
                  <div className="frame-border"></div>
                  <div className="frame-inner-border"></div>
                  <div className="corner c-tl"></div>
                  <div className="corner c-tr"></div>
                  <div className="corner c-bl"></div>
                  <div className="corner c-br"></div>
                  {!isStage && (
                    <>
                      <GuillocheCornerSVG className="cg-tl" />
                      <GuillocheCornerSVG className="cg-tr" />
                      <GuillocheCornerSVG className="cg-bl" />
                      <GuillocheCornerSVG className="cg-br" />
                    </>
                  )}
                </>
              )}

              {/* ==============================================================
                 MODÈLES 2 À 5 : 4 NOUVEAUX MODÈLES AVEC MOTIFS MODERNES EN IMAGE
                 ============================================================== */}
              {isImageMotifModel && currentModelObj.motifImage && (
                <div className="motif-bg-layer">
                  <img
                    src={currentModelObj.motifImage}
                    alt={currentModelObj.name}
                    referrerPolicy="no-referrer"
                    className="motif-bg-img"
                  />
                  <div className="motif-inner-sanctuary" />
                  <div className="motif-inner-frame" />
                </div>
              )}

              {/* INSTITUTION WATERMARK */}
              <div className="watermark-bg">
                <img
                  src={branding.watermarkUrl || "/watermark-logo.png"}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="watermark-img"
                />
              </div>

              {/* MAIN CONTENT */}
              <div className="page-content">
                
                {/* HEADER GRID */}
                <div className="header-grid">
                  <div className="header-left">
                    <strong>RÉPUBLIQUE DU CAMEROUN</strong>
                    <i>Paix – Travail – Patrie</i>
                    <br />
                    <strong>MINISTÈRE DE LA FORMATION PROFESSIONNELLE</strong>
                  </div>

                  <div className="header-center">
                    <div className="center-logo-box">
                      <img
                        src={branding.logoUrl || "/logo.jpg"}
                        alt="CFP-ITMC"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="center-title">{branding.institutionName || "CFP-ITMC"}</span>
                    <span className="center-accred">{branding.authorizationNumber || "Agréé MINEFOP • Arrêté N° 0038"}</span>
                  </div>

                  <div className="header-right">
                    <strong>REPUBLIC OF CAMEROON</strong>
                    <i>Peace – Work – Fatherland</i>
                    <br />
                    <strong>MINISTRY OF VOCATIONAL TRAINING</strong>
                  </div>
                </div>

                {/* TITLE BANNER */}
                {selectedStyle === 'classic' ? (
                  <div className="title-banner">
                    <h1 className="title-text">
                      {docTitle}
                    </h1>
                    <div>
                      <div className="doc-num-badge">
                        {isStage ? (
                          <>Enregistrement N° : {attestation.docNumber || 'CFP-ITMC-ST_2026/044'}</>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            Document Certifié N° : {attestation.docNumber || 'CFP-ITMC-FO_2026/044'}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="motif-title-wrapper">
                    <h1 className="motif-title-heading">{docTitle}</h1>
                    <div>
                      <div className="motif-doc-badge">
                        {selectedStyle === 'prestige_gold' && <Crown className="w-3.5 h-3.5 text-amber-300" />}
                        {selectedStyle === 'emerald_luxury' && <Gem className="w-3.5 h-3.5 text-amber-300" />}
                        {selectedStyle === 'azure_modern' && <QrCode className="w-3.5 h-3.5 text-sky-300" />}
                        {selectedStyle === 'bordeaux_royal' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                        <span>
                          {isStage ? "Enregistrement Officiel N°" : "Diplôme & Attestation Certifiée N°"} : {attestation.docNumber || 'CFP-ITMC-OFF_2026/044'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* BODY CONTENT DEPENDING ON CATEGORY (STAGE vs FORMATION) */}
                {isStage ? (
                  /* ===================== BODY STAGE ===================== */
                  <div className="body-text-box">
                    <p className="director-preamble">
                      Le Directeur des Études du Centre de Formation Professionnelle ITMC (CFP-ITMC) certifie et atteste que :
                    </p>

                    <div>
                      M. / Mme <span className="student-highlight-name">{attestation.studentName}</span>
                    </div>

                    {/* DETAILS GRID CONTAINER */}
                    <div className={cn(
                      selectedStyle === 'classic' ? "details-grid-container" : "motif-student-card"
                    )}>
                      {isImageMotifModel && currentModelObj.motifImage && (
                        <div className="motif-card-top-strip">
                          <img src={currentModelObj.motifImage} alt="" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="details-grid">
                        <div className="details-item">
                          <Bookmark className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <b>Matricule :</b> <span>{attestation.studentMatricule || 'Non renseigné'}</span>
                          </div>
                        </div>
                        <div className="details-item">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <b>Né(e) le :</b> <span>{attestation.birthDate || '01/01/2000'} à {attestation.birthPlace || 'Douala'}</span>
                          </div>
                        </div>
                        <div className="details-item">
                          <Award className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <b>Filière Spécialité :</b> <span>{attestation.specialty || 'Génie Informatique'}</span>
                          </div>
                        </div>
                        <div className="details-item">
                          <Bookmark className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <b>Promotion Niveau :</b> <span>{attestation.promo || 'DQP / CQP - Niveau 3'}</span>
                          </div>
                        </div>
                        <div className="details-item">
                          <Building className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <b>Structure d'Accueil :</b> <span>{attestation.companyName || 'Non spécifiée'}</span>
                          </div>
                        </div>
                        <div className="details-item">
                          <User className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <b>Tuteur de Stage :</b> <span>{attestation.companySupervisor || 'Tuteur Professionnel'}</span>
                          </div>
                        </div>
                        <div className="details-item" style={{ gridColumn: 'span 2' }}>
                          <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <b>Thème Pratique :</b> <span>{attestation.internshipTopic || 'Sujet d\'application en entreprise.'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p style={{ marginTop: '1.2mm', fontStyle: 'italic', fontSize: '3.05mm', color: 'var(--muted)' }}>
                      a accompli avec assiduité et succès son stage en milieu professionnel conformément au programme académique approuvé par le MINEFOP.
                    </p>
                    <p style={{ fontSize: '2.9mm', fontWeight: 'bold', color: 'var(--theme-primary)', marginTop: '0.4mm' }}>
                      En foi de quoi la présente attestation lui est délivrée pour servir et valoir ce que de droit.
                    </p>
                  </div>
                ) : (
                  /* ===================== BODY FORMATION DQP ===================== */
                  <div className="body-text-box">
                    <p className="director-preamble">
                      Le Directeur des Études du Centre de Formation Professionnelle Agréé MINEFOP (CFP-ITMC) certifie solennellement que :
                    </p>

                    <div>
                      M. / Mme <span className="student-highlight-name">{attestation.studentName}</span>
                    </div>

                    <p className="italic text-[12px] text-slate-500 mt-0.5 mb-1.5">
                      né(e) le {attestation.birthDate || '01/01/2002'} à {attestation.birthPlace || 'Douala'}, de nationalité Camerounaise
                    </p>

                    {/* DIPLOMA-STYLE ACADEMIC BOX */}
                    <div className={cn(
                      selectedStyle === 'classic' ? "details-diploma-box-landscape" : "motif-student-card"
                    )}>
                      {isImageMotifModel && currentModelObj.motifImage && (
                        <div className="motif-card-top-strip">
                          <img src={currentModelObj.motifImage} alt="" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div 
                        className="details-diploma-grid-landscape"
                        style={{ gridTemplateColumns: (attestation.overallAverage || attestation.mention) ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)' }}
                      >
                        <div className="diploma-row-landscape">
                          <span className="diploma-label">Numéro Matricule</span>
                          <span className="diploma-val">{attestation.studentMatricule || 'Non inscrit'}</span>
                        </div>
                        <div className="diploma-row-landscape">
                          <span className="diploma-label">Filière d'Étude Spécialité</span>
                          <span className="diploma-val highlight">{attestation.specialty || 'Ingénierie Informatique'}</span>
                        </div>
                        <div className="diploma-row-landscape">
                          <span className="diploma-label">Promotion Académique</span>
                          <span className="diploma-val">{attestation.promo || 'DQP / CQP - Niveau 3'}</span>
                        </div>
                        <div className="diploma-row-landscape">
                          <span className="diploma-label">Période d'Enseignement</span>
                          <span className="diploma-val">{attestation.sessionPeriod || 'Du 01 Octobre 2025 au 30 Juin 2026'}</span>
                        </div>
                        {attestation.overallAverage && (
                          <div className="diploma-row-landscape">
                            <span className="diploma-label">Moyenne Générale</span>
                            <span className="diploma-val highlight text-blue-800">{attestation.overallAverage}</span>
                          </div>
                        )}
                        {attestation.mention && (
                          <div className="diploma-row-landscape">
                            <span className="diploma-label">Mention Acquise</span>
                            <span className="diploma-val text-amber-700 font-extrabold">{attestation.mention}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p style={{ marginTop: '1mm', fontStyle: 'italic', fontSize: '3mm', color: 'var(--muted)' }}>
                      a satisfait à toutes les exigences théoriques et pratiques du programme homologué et a validé l&apos;intégralité de ses modules.
                    </p>
                    <p style={{ fontSize: '2.95mm', fontWeight: 'bold', color: 'var(--theme-primary)', marginTop: '0.4mm' }}>
                      En foi de quoi la présente Attestation officielle lui est délivrée pour servir et valoir ce que de droit.
                    </p>
                  </div>
                )}

                {/* FOOTER SIGNATURES & STAMPS */}
                <div className="footer-signatures">
                  <div className="sig-box">
                    <div className="title">
                      {isStage ? "Le Tuteur Professionnel" : "Le Secrétaire Général"}
                    </div>
                    <div className="name">
                      {isStage ? (attestation.companySupervisor || 'Encadrant Entreprise') : "Direction Administrative"}
                    </div>
                  </div>

                  {/* CENTER SEAL ACCORDING TO MODEL & CATEGORY */}
                  {selectedStyle === 'classic' ? (
                    isStage ? (
                      /* Original Classic Stage Seal */
                      <div className="center-seal">
                        <div className="seal-circle">
                          <span>Sceau Officiel</span>
                          <ShieldCheck className="w-4 h-4 text-amber-600 my-0.5" />
                          <span>CFP-ITMC</span>
                        </div>
                        <span style={{ fontSize: '2mm', fontFamily: 'Segoe UI', color: '#5a6785', fontWeight: 'bold' }}>
                          Certification Scolarité
                        </span>
                      </div>
                    ) : (
                      /* Original Classic Formation Gold Academic Seal with Ribbons */
                      <div className="gold-seal-container">
                        <div className="gold-academic-seal">
                          <div className="gold-seal-inner" style={{ background: '#0b2a63' }}>
                            <div className="seal-inst">CFP-ITMC</div>
                            <div className="seal-center">DIPLÔME</div>
                            <div className="seal-motto">MINEFOP</div>
                          </div>
                        </div>
                        <div className="gold-seal-ribbons">
                          <div className="seal-ribbon"></div>
                          <div className="seal-ribbon seal-ribbon-second"></div>
                        </div>
                      </div>
                    )
                  ) : selectedStyle === 'azure_modern' ? (
                    <div className="center-seal">
                      <div className="seal-circle" style={{ background: '#f0f9ff', borderColor: '#0284c7', borderStyle: 'solid' }}>
                        <QrCode className="w-5 h-5 text-sky-600 my-0.5" />
                        <span style={{ fontSize: '1.55mm', color: '#0284c7', fontWeight: 900 }}>CERTIFIÉ QR</span>
                      </div>
                      <span style={{ fontSize: '1.8mm', fontFamily: 'Segoe UI', color: '#0284c7', fontWeight: 'bold' }}>
                        Authenticité Numérique
                      </span>
                    </div>
                  ) : (
                    /* Gold Academic Seal with Theme-Colored Inner Circle for Prestige Gold, Emerald Luxury & Bordeaux Royal */
                    <div className="gold-seal-container">
                      <div className="gold-academic-seal">
                        <div
                          className="gold-seal-inner"
                          style={{
                            background:
                              selectedStyle === 'emerald_luxury'
                                ? '#064e3b'
                                : selectedStyle === 'bordeaux_royal'
                                ? '#7f1d1d'
                                : '#0a1e3f'
                          }}
                        >
                          <div className="seal-inst">CFP-ITMC</div>
                          <div className="seal-center">SCEAU</div>
                          <div className="seal-motto">OFFICIEL</div>
                        </div>
                      </div>
                      <div className="gold-seal-ribbons">
                        <div
                          className="seal-ribbon"
                          style={{
                            background:
                              selectedStyle === 'emerald_luxury'
                                ? 'linear-gradient(to right, #047857, #10b981, #065f46)'
                                : selectedStyle === 'bordeaux_royal'
                                ? 'linear-gradient(to right, #7f1d1d, #b91c1c, #450a0a)'
                                : 'linear-gradient(to right, #1e3a8a, #2563eb, #172554)'
                          }}
                        />
                        <div
                          className="seal-ribbon seal-ribbon-second"
                          style={{
                            background:
                              selectedStyle === 'emerald_luxury'
                                ? 'linear-gradient(to right, #047857, #10b981, #065f46)'
                                : selectedStyle === 'bordeaux_royal'
                                ? 'linear-gradient(to right, #7f1d1d, #b91c1c, #450a0a)'
                                : 'linear-gradient(to right, #b91c1c, #dc2626, #991b1b)'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="sig-box">
                    <div style={{ fontSize: '2.65mm', color: 'var(--theme-primary)', fontWeight: 'bold', marginBottom: '1mm' }}>
                      Fait à {attestation.issueCity || 'Douala'}, le {attestation.issueDate || new Date().toLocaleDateString('fr-FR')}
                    </div>
                    <div className="title">Le Directeur des Études</div>
                    <div className="name">{attestation.directorName || 'Dr. TCHAPGNIN Gédéon'}</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
