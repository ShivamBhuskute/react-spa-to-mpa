import fs from 'fs-extra';
import path from 'path';

export async function detectRoutes(inputDir, routesConfigPath) {
  if (routesConfigPath) {
    try {
      const configPath = path.resolve(process.cwd(), routesConfigPath);
      const routesData = await fs.readJson(configPath);
      if (Array.isArray(routesData)) {
        return routesData;
      }
      if (routesData.routes && Array.isArray(routesData.routes)) {
        return routesData.routes;
      }
      throw new Error('Invalid routes config format. Expected an array or an object with a "routes" array property.');
    } catch (err) {
      throw new Error(`Failed to read routes config: ${err.message}`);
    }
  }

  // Fallback if no routes config provided
  console.warn("No routes config provided. Only generating root '/' route.");
  return ['/'];
}
