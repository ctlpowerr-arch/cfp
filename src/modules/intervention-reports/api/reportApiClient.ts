import {
  AttachmentCategory,
  InterventionReport,
  InterventionReportAggregate,
  ReportAttachment,
  ReportStatus,
} from '../types/report.types';

function getAuthHeaders(): Record<string, string> {
  const token =
    sessionStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
    sessionStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
    localStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
    localStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
    '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export interface ReportListItem extends InterventionReport {
  counts: {
    steps: number;
    attachments: number;
    evaluations: number;
    tests: number;
  };
  permissions: {
    canEdit: boolean;
    canSubmit: boolean;
    canUpload: boolean;
    canReview: boolean;
    canApprove: boolean;
    canRequestChanges: boolean;
    canArchive: boolean;
    canDelete: boolean;
  };
}

export interface ReportListResponse {
  items: ReportListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalAccessible: number;
    byStatus: Record<ReportStatus, number>;
    pendingTeacherActionCount: number;
    averageScoreOn20: number | null;
    totalHoursLogged: number;
  };
  actorPerimeter: {
    role: string;
    teacherId?: string;
    teacherName?: string;
    authorizedSpecialties?: string[];
    authorizedClasses?: string[];
  };
}

export interface SecuritySelfTestResponse {
  allPassed: boolean;
  executedAt: string;
  checks: Array<{
    code: string;
    label: string;
    passed: boolean;
    detail?: string;
  }>;
}

export const interventionReportApi = {
  async getContext() {
    const res = await fetch('/api/intervention-reports/context', {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement du contexte.');
    return data;
  },

  async listReports(params: {
    academicYear?: string;
    status?: string;
    specialty?: string;
    formation?: string;
    classCode?: string;
    interventionType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ReportListResponse> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        qs.set(key, String(val));
      }
    });

    const res = await fetch(`/api/intervention-reports?${qs.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement des rapports.');
    return data;
  },

  async getReportById(reportId: string): Promise<InterventionReportAggregate> {
    const res = await fetch(`/api/intervention-reports/${encodeURIComponent(reportId)}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Accès refusé ou rapport introuvable.');
    return data;
  },

  async createReport(payload: Record<string, any>): Promise<InterventionReportAggregate> {
    const res = await fetch('/api/intervention-reports', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de création du rapport.');
    return data;
  },

  async updateDraft(
    reportId: string,
    payload: Record<string, any>
  ): Promise<InterventionReportAggregate> {
    const res = await fetch(`/api/intervention-reports/${encodeURIComponent(reportId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de mise à jour du rapport.');
    return data;
  },

  async submitReport(
    reportId: string,
    submissionNote?: string
  ): Promise<InterventionReportAggregate> {
    const res = await fetch(`/api/intervention-reports/${encodeURIComponent(reportId)}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        submissionNote,
        idempotencyKey: `sub_${reportId}_${Date.now()}`,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de soumission du rapport.');
    return data;
  },

  async evaluateReport(
    reportId: string,
    payload: {
      decision: ReportStatus;
      scoreOn20?: number | null;
      technicalScoreOn20?: number | null;
      methodScoreOn20?: number | null;
      safetyScoreOn20?: number | null;
      redactionScoreOn20?: number | null;
      generalFeedback?: string;
      strengths?: string;
      improvementsRequired?: string;
    }
  ): Promise<InterventionReportAggregate> {
    const res = await fetch(`/api/intervention-reports/${encodeURIComponent(reportId)}/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de l’évaluation du rapport.');
    return data;
  },

  async uploadAttachment(
    reportId: string,
    payload: {
      originalFileName: string;
      mimeType?: string;
      base64Data: string;
      category: AttachmentCategory;
      caption?: string;
      stepId?: string | null;
    }
  ): Promise<ReportAttachment & { downloadUrl: string }> {
    const res = await fetch(
      `/api/intervention-reports/${encodeURIComponent(reportId)}/attachments`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de l’envoi du fichier.');
    return data;
  },

  async deleteAttachment(reportId: string, attachmentId: string): Promise<void> {
    const res = await fetch(
      `/api/intervention-reports/${encodeURIComponent(reportId)}/attachments/${encodeURIComponent(attachmentId)}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de suppression de la pièce jointe.');
  },

  async deleteReport(reportId: string): Promise<void> {
    const res = await fetch(`/api/intervention-reports/${encodeURIComponent(reportId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Échec de suppression du rapport.');
  },

  async runSecuritySelfTest(): Promise<SecuritySelfTestResponse> {
    const res = await fetch('/api/intervention-reports/security-self-test', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur lors de l’auto-diagnostic de sécurité.');
    return data;
  },
};
