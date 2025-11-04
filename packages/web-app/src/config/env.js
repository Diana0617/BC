// Environment configuration for web app
// This file sets up the API URL for the shared module

// Set the API URL in a global variable that the shared module can access
if (typeof window !== 'undefined') {
  const envApiUrl = import.meta.env.VITE_API_URL;
  const { protocol, hostname } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isLanIp = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
  const localApiPort = import.meta.env.VITE_API_PORT || 3001;

  // Use explicit env value when provided; otherwise infer a sensible local default
  const inferredApiUrl = (() => {
    if (isLocalhost || isLanIp) {
      return `${protocol}//${hostname}:${localApiPort}`;
    }
    return 'http://localhost:3001';
  })();

  window.__BC_API_URL__ = envApiUrl || inferredApiUrl;
}

export default typeof window !== 'undefined' ? window.__BC_API_URL__ : undefined;