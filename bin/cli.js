#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import { convertToMpa } from '../src/index.js';
import { detectRoutes } from '../src/route-detector.js';

const program = new Command();

// Read package.json for version
const packageJsonPath = new URL('../package.json', import.meta.url);
const pkg = await fs.readJson(packageJsonPath);

program
  .name('spa-to-mpa')
  .description(pkg.description)
  .version(pkg.version);

program
  .command('build')
  .description('Convert a built SPA to an MPA')
  .argument('<inputDir>', 'Directory containing the built SPA (e.g., dist)')
  .argument('<outputDir>', 'Directory to output the generated MPA (e.g., mpa-dist)')
  .option('-r, --routes <path>', 'Path to a JSON file containing an array of routes (e.g., ["/", "/about"])')
  .action(async (inputDir, outputDir, options) => {
    try {
      console.log(chalk.cyan(`Starting SPA to MPA conversion...`));
      
      const routes = await detectRoutes(inputDir, options.routes);
      
      await convertToMpa({
        inputDir,
        outputDir,
        routes
      });
      
    } catch (err) {
      console.error(chalk.red.bold('\nError:'), chalk.red(err.message));
      process.exit(1);
    }
  });

program.parse(process.argv);
