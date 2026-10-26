import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import ts from 'typescript';

const rootDir = process.cwd();

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const subPath = specifier.slice(2);
    const candidates = [
      path.join(rootDir, `${subPath}.ts`),
      path.join(rootDir, `${subPath}.tsx`),
      path.join(rootDir, subPath, 'index.ts'),
      path.join(rootDir, subPath, 'index.tsx'),
      path.join(rootDir, `${subPath}.js`),
      path.join(rootDir, subPath),
    ];

    for (const cand of candidates) {
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
        return {
          shortCircuit: true,
          url: pathToFileURL(cand).href,
        };
      }
    }
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const filePath = fileURLToPath(url);
    const source = fs.readFileSync(filePath, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.Preserve,
      },
    });

    return {
      format: 'module',
      shortCircuit: true,
      source: outputText,
    };
  }

  return nextLoad(url, context);
}
