export interface AppConfig {
  apiUrl: string;
  landingUrl: string;
}

const LOCAL_CONFIG: AppConfig = {
  landingUrl: 'http://localhost:3000',
  apiUrl: 'https://apidev-turnow.shiftya.online/api',
};

const PROD_FALLBACK_CONFIG: AppConfig = {
  landingUrl: 'https://www.shiftya.online',
  apiUrl: 'https://api-turnow.shiftya.online/api',
};

let configPromise: Promise<AppConfig> | null = null;

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isDevHost(hostname: string): boolean {
  const knownDevHosts = ['dev.shiftya.online'];
  if (knownDevHosts.includes(hostname)) return true;

  // Keep compatibility with existing naming conventions in case hostnames change.
  return hostname.startsWith('dev-') || hostname.includes('.dev.') || hostname.includes('-dev');
}

function normalizeApiUrl(apiUrl: string): string {
  const trimmed = apiUrl.replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function normalizeConfig(config: AppConfig): AppConfig {
  return {
    ...config,
    apiUrl: normalizeApiUrl(config.apiUrl),
  };
}

export async function getRuntimeConfig(): Promise<AppConfig> {
  if (configPromise) return configPromise;

  configPromise = (async () => {
    const hostname = window.location.hostname;

    if (isLocalHost(hostname)) {
      return normalizeConfig({
        ...LOCAL_CONFIG,
        landingUrl: window.location.origin,
      });
    }

    const configFile = isDevHost(hostname) ? '/config.development.json' : '/config.json';

    try {
      const res = await fetch(configFile);
      const cfg = (await res.json()) as AppConfig;
      return normalizeConfig(cfg);
    } catch (err) {
      console.warn(`Failed to load ${configFile}, using fallback config:`, err);
      return normalizeConfig(PROD_FALLBACK_CONFIG);
    }
  })();

  return configPromise;
}

export async function getApiBaseUrl(): Promise<string> {
  const cfg = await getRuntimeConfig();
  return cfg.apiUrl;
}

export async function getLandingUrl(): Promise<string> {
  const cfg = await getRuntimeConfig();
  return cfg.landingUrl;
}
