import fs from 'fs-extra';
import path from 'path';
import * as cheerio from 'cheerio';
import chalk from 'chalk';

export async function convertToMpa({ inputDir, outputDir, routes }) {
  const absoluteInputDir = path.resolve(process.cwd(), inputDir);
  const absoluteOutputDir = path.resolve(process.cwd(), outputDir);

  if (!(await fs.pathExists(absoluteInputDir))) {
    throw new Error(`Input directory "${inputDir}" does not exist.`);
  }

  const indexPath = path.join(absoluteInputDir, 'index.html');
  if (!(await fs.pathExists(indexPath))) {
    throw new Error(`index.html not found in "${inputDir}". Ensure it is a valid SPA build directory.`);
  }

  // 1. Copy all assets from inputDir to outputDir (excluding index.html)
  console.log(chalk.blue(`Copying assets from ${inputDir} to ${outputDir}...`));
  await fs.ensureDir(absoluteOutputDir);
  const items = await fs.readdir(absoluteInputDir);
  for (const item of items) {
    if (item === 'index.html') continue; // We handle index.html separately
    await fs.copy(path.join(absoluteInputDir, item), path.join(absoluteOutputDir, item));
  }

  // 2. Read the source index.html
  const sourceHtml = await fs.readFile(indexPath, 'utf-8');

  // 3. Generate pages for each route
  console.log(chalk.blue(`Generating MPA pages for ${routes.length} routes...`));
  for (const routeData of routes) {
    // routeData can be a string "/about" or an object { path: "/about", title: "...", description: "...", image: "..." }
    const isObject = typeof routeData === 'object' && routeData !== null;
    const route = isObject ? routeData.path : routeData;
    const meta = isObject ? routeData : {};

    if (!route) {
      console.warn(chalk.yellow(`Warning: Skipped invalid route entry: ${JSON.stringify(routeData)}`));
      continue;
    }

    // Clean route
    const cleanRoute = route.replace(/^\//, '').replace(/\/$/, ''); // Remove leading/trailing slashes
    const targetDir = path.join(absoluteOutputDir, cleanRoute);
    const targetHtmlPath = path.join(targetDir, 'index.html');

    // Calculate relative depth to correct asset paths if they are relative
    const depth = cleanRoute === '' ? 0 : cleanRoute.split('/').length;
    let relativePrefix = '';
    for (let i = 0; i < depth; i++) {
      relativePrefix += '../';
    }
    if (relativePrefix === '') {
      relativePrefix = './'; // Current dir
    }

    // Load HTML in cheerio
    const $ = cheerio.load(sourceHtml);

    // Inject SEO / Social Preview Meta Tags if provided
    if (meta.title) {
      if ($('title').length) $('title').text(meta.title);
      else $('head').append(`<title>${meta.title}</title>`);
      
      if ($('meta[property="og:title"]').length) $('meta[property="og:title"]').attr('content', meta.title);
      else $('head').append(`<meta property="og:title" content="${meta.title}">`);
      
      if ($('meta[name="twitter:title"]').length) $('meta[name="twitter:title"]').attr('content', meta.title);
      else $('head').append(`<meta name="twitter:title" content="${meta.title}">`);
    }

    if (meta.description) {
      if ($('meta[name="description"]').length) $('meta[name="description"]').attr('content', meta.description);
      else $('head').append(`<meta name="description" content="${meta.description}">`);

      if ($('meta[property="og:description"]').length) $('meta[property="og:description"]').attr('content', meta.description);
      else $('head').append(`<meta property="og:description" content="${meta.description}">`);
      
      if ($('meta[name="twitter:description"]').length) $('meta[name="twitter:description"]').attr('content', meta.description);
      else $('head').append(`<meta name="twitter:description" content="${meta.description}">`);
    }

    if (meta.image) {
      if ($('meta[property="og:image"]').length) $('meta[property="og:image"]').attr('content', meta.image);
      else $('head').append(`<meta property="og:image" content="${meta.image}">`);
      
      if ($('meta[name="twitter:image"]').length) $('meta[name="twitter:image"]').attr('content', meta.image);
      else $('head').append(`<meta name="twitter:image" content="${meta.image}">`);
      
      if (!$('meta[name="twitter:card"]').length) $('head').append(`<meta name="twitter:card" content="summary_large_image">`);
    }

    // Helper to fix paths
    const fixPath = (attrPath) => {
      if (!attrPath) return attrPath;
      if (attrPath.startsWith('http://') || attrPath.startsWith('https://') || attrPath.startsWith('//')) {
        return attrPath; 
      }
      if (attrPath.startsWith('/')) {
        return attrPath; 
      }
      const cleanAttrPath = attrPath.startsWith('./') ? attrPath.substring(2) : attrPath;
      return relativePrefix + cleanAttrPath;
    };

    // Adjust scripts, links, images
    $('script[src]').each((_, el) => $(el).attr('src', fixPath($(el).attr('src'))));
    $('link[href]').each((_, el) => $(el).attr('href', fixPath($(el).attr('href'))));
    $('img[src]').each((_, el) => $(el).attr('src', fixPath($(el).attr('src'))));

    await fs.ensureDir(targetDir);
    await fs.writeFile(targetHtmlPath, $.html());
    console.log(chalk.green(`  Created: ${route === '' || route === '/' ? '/ (index)' : `/${cleanRoute}`}`));
  }

  console.log(chalk.green.bold('\n✨ MPA generated successfully!'));
}
