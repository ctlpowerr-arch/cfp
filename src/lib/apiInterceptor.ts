/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global Fetch Interceptor to guarantee secure JWT + HttpOnly credentials on every API call
export function setupFetchInterceptor() {
  if (typeof window === 'undefined') return;

  try {
    const rawFetch = window.fetch;
    if (typeof rawFetch !== 'function') return;

    const originalFetch = rawFetch.bind(window);

    const interceptedFetch: typeof window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      try {
        let url = '';
        if (typeof input === 'string') {
          url = input;
        } else if (input instanceof URL) {
          url = input.toString();
        } else if (input && typeof input === 'object' && 'url' in input) {
          url = (input as Request).url;
        }

        const isApiRequest = url.startsWith('/api/') || url.includes('/api/');

        if (isApiRequest) {
          const options: RequestInit = init ? { ...init } : {};

          // 1. Ensure HttpOnly cookies are transmitted
          if (!options.credentials) {
            options.credentials = 'include';
          }

          // 2. Transmit Bearer token if not already attached
          const headers = new Headers(options.headers || (input instanceof Request ? input.headers : undefined) || {});

          if (!headers.has('Authorization')) {
            const token = 
              sessionStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
              sessionStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION') ||
              localStorage.getItem('ITMC_PORTAL_SESSION_TOKEN') ||
              localStorage.getItem('ITMC_PORTAL_ENCRYPTED_SESSION');

            if (token && typeof token === 'string' && token.trim()) {
              headers.set('Authorization', `Bearer ${token.trim()}`);
            }
          }

          // 3. Attach current active academic year if present
          if (!headers.has('x-academic-year')) {
            try {
              const ay = localStorage.getItem('itmc_academic_year') || '2026-2027';
              if (ay) headers.set('x-academic-year', ay);
            } catch {}
          }

          options.headers = headers;

          return originalFetch(input, options);
        }
      } catch (err) {
        // Fallback silently if any internal processing fails
        return originalFetch(input, init);
      }

      return originalFetch(input, init);
    };

    // Safely attempt interception without throwing errors
    let intercepted = false;
    try {
      const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
      if (!desc || desc.writable || desc.set || desc.configurable) {
        Object.defineProperty(window, 'fetch', {
          value: interceptedFetch,
          writable: true,
          configurable: true,
          enumerable: true,
        });
        intercepted = true;
      }
    } catch {}

    if (!intercepted) {
      try {
        const proto = Object.getPrototypeOf(window);
        const protoDesc = proto ? Object.getOwnPropertyDescriptor(proto, 'fetch') : null;
        if (protoDesc && (protoDesc.configurable || protoDesc.writable || protoDesc.set)) {
          Object.defineProperty(proto, 'fetch', {
            value: interceptedFetch,
            writable: true,
            configurable: true,
            enumerable: true,
          });
          intercepted = true;
        }
      } catch {}
    }
  } catch (err) {
    // Interceptor must never throw or block application boot
    console.warn("Global fetch interceptor initialization note:", err);
  }
}

