import {
  AttachmentCategory,
  ProfessionalReport,
  ProfessionalReportAggregate,
  ProfessionalReportStatus,
  ReportAttachmentItem,
  ReportTemplate,
} from '../types/professionalReport.types';
import { SpecialtyDefinition } from '../templates/specialtyTemplatesCatalog';

function getAuthHeaders(): Record<string, string> {
  const token =
    sessionStorage.getItem('itmc_auth_token') ||
    localStorage.getItem('itmc_auth_token') ||
    '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface SecuritySelfTestResponse {
  engineVersion: string;
  totalRegisteredSpecialties: number;
  expectedSpecialtiesCount: number;
  categoriesCount: number;
  architectureStatus: string;
  tests: Array<{
    name: string;
    status: 'PASSED' | 'FAILED';
    details: string;
  }>;
  timestamp: string;
}

export const professionalReportApi = {
  async fetchSpecialties(): Promise<{ specialties: SpecialtyDefinition[]; templatesCount: number }> {
    const res = await fetch('/api/professional-reports/specialties', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Impossible de charger le catalogue des spécialités.');
    return res.json();
  },

  async fetchTemplateBySpecialty(specialtyId: string): Promise<ReportTemplate> {
    const res = await fetch(`/api/professional-reports/templates/${encodeURIComponent(specialtyId)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Impossible de charger le modèle pour ${specialtyId}`);
    return res.json();
  },

  async fetchReports(filters: {
    status?: string;
    category?: string;
    specialtyId?: string;
    search?: string;
    academicYear?: string;
  } = {}): Promise<{ reports: ProfessionalReport[]; total: number }> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.category && filters.category !== 'ALL') params.set('category', filters.category);
    if (filters.specialtyId && filters.specialtyId !== 'ALL') params.set('specialtyId', filters.specialtyId);
    if (filters.search) params.set('search', filters.search);
    if (filters.academicYear) params.set('academicYear', filters.academicYear);

    const res = await fetch(`/api/professional-reports?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur lors du chargement des rapports professionnels.');
    return res.json();
  },

  async fetchReportById(reportId: string): Promise<ProfessionalReportAggregate> {
    const res = await fetch(`/api/professional-reports/${encodeURIComponent(reportId)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors du chargement du rapport.');
    }
    return res.json();
  },

  async createReport(payload: Partial<ProfessionalReport>): Promise<ProfessionalReportAggregate> {
    const res = await fetch('/api/professional-reports', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la création du rapport.');
    }
    return res.json();
  },

  async updateReport(
    reportId: string,
    payload: Partial<ProfessionalReport>,
    isAutosave: boolean = false
  ): Promise<ProfessionalReportAggregate> {
    const res = await fetch(
      `/api/professional-reports/${encodeURIComponent(reportId)}?autosave=${isAutosave}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la sauvegarde du rapport.');
    }
    return res.json();
  },

  async submitReport(reportId: string): Promise<ProfessionalReportAggregate> {
    const res = await fetch(`/api/professional-reports/${encodeURIComponent(reportId)}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de la soumission du rapport.');
    }
    return res.json();
  },

  async evaluateReport(
    reportId: string,
    payload: {
      decision: ProfessionalReportStatus.CHANGES_REQUESTED | ProfessionalReportStatus.APPROVED;
      scoreOn20?: number;
      criteriaScores?: Record<string, number>;
      generalFeedback: string;
      strengths?: string;
      improvementsRequired?: string;
      annotatedSections?: Array<{ sectionKey: string; comment: string; severity: 'INFO' | 'WARNING' | 'REQUIRED' }>;
    }
  ): Promise<ProfessionalReportAggregate> {
    const res = await fetch(`/api/professional-reports/${encodeURIComponent(reportId)}/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors de l’évaluation.');
    }
    return res.json();
  },

  async uploadAttachment(
    reportId: string,
    payload: {
      base64Data: string;
      originalName: string;
      category: AttachmentCategory;
      caption?: string;
    }
  ): Promise<ReportAttachmentItem> {
    const res = await fetch(`/api/professional-reports/${encodeURIComponent(reportId)}/attachments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erreur lors du téléversement de la pièce jointe.');
    }
    return res.json();
  },

  async deleteAttachment(reportId: string, attachmentId: string): Promise<{ success: boolean }> {
    const res = await fetch(
      `/api/professional-reports/${encodeURIComponent(reportId)}/attachments/${encodeURIComponent(attachmentId)}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    if (!res.ok) throw new Error('Erreur lors de la suppression de la pièce jointe.');
    return res.json();
  },

  async runSecuritySelfTest(): Promise<SecuritySelfTestResponse> {
    const res = await fetch('/api/professional-reports/security-self-test', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Erreur lors de l’exécution de l’auto-diagnostic de sécurité.');
    return res.json();
  },
};
