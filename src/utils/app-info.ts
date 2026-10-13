type AppInfo = {
  name: string;
  version: string;
  description: string;
  homepage?: string;
};

let cachedAppInfo: AppInfo | undefined;

/**
 * Load package metadata in one place so CLI/server/tools report the same version.
 */
export function getAppInfo(): AppInfo {
  if (cachedAppInfo) {
    return cachedAppInfo;
  }

  try {
    const packageJson = require('../../package.json');
    cachedAppInfo = {
      name: packageJson.name || 'GeoGebra Studio',
      version: packageJson.version || '0.0.0',
      description: packageJson.description || 'Model Context Protocol server for GeoGebra mathematical visualization',
      homepage: packageJson.homepage
    };
  } catch (_error) {
    cachedAppInfo = {
      name: 'GeoGebra Studio',
      version: '0.0.0',
      description: 'Model Context Protocol server for GeoGebra mathematical visualization'
    };
  }

  return cachedAppInfo;
}
