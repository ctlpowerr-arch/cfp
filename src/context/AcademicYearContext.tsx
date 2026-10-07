import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AcademicYear {
  id: string;
  name: string;
  code?: string;
  label?: string;
  status: string;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
  description?: string;
  createdAt?: string;
  statistics?: {
    studentsCount?: number;
    compositionsCount?: number;
    caisseTotal?: number;
  };
}

interface AcademicYearContextType {
  selectedYear: string;
  currentYear: any;
  currentAcademicYear: any;
  setSelectedYear: (year: string) => void;
  years: AcademicYear[];
  loadingYears: boolean;
  addAcademicYear: (yearData: string | { name: string; status?: string; isCurrent?: boolean; startDate?: string; endDate?: string; description?: string }, isCurrent?: boolean) => Promise<boolean>;
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => Promise<boolean>;
  deleteAcademicYear: (id: string) => Promise<boolean>;
  rolloverAcademicYear: (id: string, payload: { targetYearName: string; autoPromoteG1ToG2?: boolean }) => Promise<boolean>;
  refreshYears: () => Promise<void>;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

export const AcademicYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYearState] = useState<string>(() => {
    const saved = localStorage.getItem("itmc_active_academic_year");
    if (!saved || saved === "2025-2026") {
      localStorage.setItem("itmc_active_academic_year", "2026-2027");
      return "2026-2027";
    }
    return saved;
  });
  const [years, setYears] = useState<AcademicYear[]>([
    { id: "2024-2025", name: "2024-2025", status: "Clôturée", isCurrent: false },
    { id: "2025-2026", name: "2025-2026", status: "Clôturée", isCurrent: false },
    { id: "2026-2027", name: "2026-2027", status: "En Cours", isCurrent: true }
  ]);
  const [loadingYears, setLoadingYears] = useState(false);

  const fetchYears = async () => {
    try {
      setLoadingYears(true);
      const res = await fetch("/api/academic-years");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setYears(data);
          // If selected year is no longer valid, fallback to current or first
          if (!data.some(y => y.name === selectedYear)) {
            const currentYear = data.find(y => y.isCurrent) || data[0];
            if (currentYear) {
              setSelectedYearState(currentYear.name);
              localStorage.setItem("itmc_active_academic_year", currentYear.name);
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch academic years", err);
    } finally {
      setLoadingYears(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  // Intercept window.fetch to automatically include x-academic-year, Authorization and CSRF headers for API requests
  useEffect(() => {
    const originalFetch = window.fetch;
    const patchedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      let url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      if (url.startsWith('/api/') || url.startsWith(window.location.origin + '/api/')) {
        const headers = new Headers(init?.headers || {});
        if (!headers.has('x-academic-year') && selectedYear) {
          headers.set('x-academic-year', selectedYear);
        }
        const token =
          sessionStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
          sessionStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
          localStorage.getItem('ITMC_PORTAL_SESSION_TOKEN');
        if (token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        const csrfToken = sessionStorage.getItem('ITMC_CSRF_TOKEN');
        if (csrfToken && !headers.has('x-csrf-token')) {
          headers.set('x-csrf-token', csrfToken);
        }
        init = { ...init, headers };
      }
      return originalFetch(input, init);
    };

    try {
      Object.defineProperty(window, 'fetch', {
        value: patchedFetch,
        writable: true,
        configurable: true
      });
    } catch (e) {
      console.warn("Could not define window.fetch property", e);
    }

    return () => {
      try {
        Object.defineProperty(window, 'fetch', {
          value: originalFetch,
          writable: true,
          configurable: true
        });
      } catch (e) {
        // ignore
      }
    };
  }, [selectedYear]);

  const setSelectedYear = (year: string) => {
    setSelectedYearState(year);
    localStorage.setItem("itmc_active_academic_year", year);
  };

  const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
    const token =
      sessionStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
      sessionStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
      localStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
      localStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
      localStorage.getItem('token');
    return {
      ...extraHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(selectedYear ? { 'x-academic-year': selectedYear } : {})
    };
  };

  const addAcademicYear = async (
    yearData: string | { name: string; status?: string; isCurrent?: boolean; startDate?: string; endDate?: string; description?: string },
    isCurrentParam: boolean = false
  ): Promise<boolean> => {
    try {
      const payload = typeof yearData === 'string'
        ? { name: yearData, status: isCurrentParam ? "En Cours" : "Planifiée", isCurrent: isCurrentParam }
        : { ...yearData, status: yearData.status || (yearData.isCurrent ? "En Cours" : "Planifiée") };

      const res = await fetch("/api/academic-years", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchYears();
        if (payload.isCurrent || typeof yearData === 'string') {
          setSelectedYear(payload.name);
        }
        return true;
      }
    } catch (err) {
      console.error("Failed to create academic year", err);
    }
    return false;
  };

  const updateAcademicYear = async (id: string, data: Partial<AcademicYear>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/academic-years/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        await fetchYears();
        if (data.isCurrent || (id === selectedYear && updated?.name)) {
          setSelectedYear(updated?.name || id);
        }
        return true;
      }
    } catch (err) {
      console.error("Failed to update academic year", err);
    }
    return false;
  };

  const deleteAcademicYear = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/academic-years/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        await fetchYears();
        return true;
      }
    } catch (err) {
      console.error("Failed to delete academic year", err);
    }
    return false;
  };

  const rolloverAcademicYear = async (
    id: string,
    payload: { targetYearName: string; autoPromoteG1ToG2?: boolean }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/academic-years/${encodeURIComponent(id)}/rollover`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchYears();
        setSelectedYear(payload.targetYearName);
        return true;
      }
    } catch (err) {
      console.error("Failed to execute rollover", err);
    }
    return false;
  };

  const activeYearObj = years.find(y => y.name === selectedYear || y.id === selectedYear) || {
    id: selectedYear,
    name: selectedYear,
    code: selectedYear,
    label: selectedYear,
    status: "En Cours",
    isCurrent: true
  };

  const richYear = {
    id: activeYearObj.id || selectedYear,
    name: activeYearObj.name || selectedYear,
    code: (activeYearObj as any).code || activeYearObj.name || selectedYear,
    label: (activeYearObj as any).label || activeYearObj.name || selectedYear,
    status: activeYearObj.status || "En Cours",
    isCurrent: activeYearObj.isCurrent,
    toString: () => selectedYear
  };

  return (
    <AcademicYearContext.Provider
      value={{
        selectedYear,
        currentYear: richYear,
        currentAcademicYear: richYear,
        setSelectedYear,
        years,
        loadingYears,
        addAcademicYear,
        updateAcademicYear,
        deleteAcademicYear,
        rolloverAcademicYear,
        refreshYears: fetchYears
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
};

export const useAcademicYear = () => {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error("useAcademicYear must be used within an AcademicYearProvider");
  }
  return context;
};
