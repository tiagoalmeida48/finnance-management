import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIST_DIR = path.resolve('dist');
const CONFIG_PATH = path.resolve('performance-budget.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Missing config file: ${CONFIG_PATH}`);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function gzipSize(filePath) {
  const content = fs.readFileSync(filePath);
  return zlib.gzipSync(content).length;
}

function formatKb(bytes) {
  return (bytes / 1024).toFixed(1);
}

function parseInitialJsAssets() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html not found. Run build first.');
  }

  const html = fs.readFileSync(indexPath, 'utf8');
  const matches = html.match(/(?:src|href)="\/assets\/([^"]+\.js)"/g) ?? [];
  const files = new Set(matches.map((entry) => entry.match(/\/assets\/([^"]+\.js)/)?.[1]).filter(Boolean));
  return [...files];
}

function resolveException(filename, exceptions) {
  return exceptions.find((item) => {
    const regex = new RegExp(item.pattern);
    return regex.test(filename);
  });
}

function main() {
  const config = loadConfig();
  const assetsDir = path.join(DIST_DIR, 'assets');
  if (!fs.existsSync(assetsDir)) {
    throw new Error('dist/assets not found. Run build first.');
  }

  const jsFiles = fs.readdirSync(assetsDir).filter((file) => file.endsWith('.js'));
  const initialAssets = parseInitialJsAssets();

  const budgets = config.budgets;
  const exceptions = config.exceptions ?? [];
  const errors = [];

  const initialTotal = initialAssets.reduce((sum, file) => {
    const fullPath = path.join(assetsDir, file);
    if (!fs.existsSync(fullPath)) return sum;
    return sum + gzipSize(fullPath);
  }, 0);

  const initialLimit = budgets.initialJsGzipKb * 1024;
  if (initialTotal > initialLimit) {
    errors.push(
      `Initial JS gzip budget exceeded: ${formatKb(initialTotal)} KB > ${budgets.initialJsGzipKb} KB`
    );
  }

  for (const file of jsFiles) {
    const fullPath = path.join(assetsDir, file);
    const size = gzipSize(fullPath);
    const defaultLimit = budgets.maxChunkGzipKb * 1024;
    const exception = resolveException(file, exceptions);
    const limit = (exception?.maxChunkGzipKb ?? budgets.maxChunkGzipKb) * 1024;

    if (size > limit) {
      const reason = exception?.reason ? ` (${exception.reason})` : '';
      errors.push(
        `Chunk gzip budget exceeded: ${file} = ${formatKb(size)} KB > ${formatKb(limit)} KB${reason}`
      );
    }
  }

  console.log(`Initial JS (gzip): ${formatKb(initialTotal)} KB`);
  console.log(`Checked ${jsFiles.length} JS chunks in dist/assets`);

  if (errors.length > 0) {
    console.error('\nPerformance budget check failed:');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log('Performance budget check passed.');
}

main();
