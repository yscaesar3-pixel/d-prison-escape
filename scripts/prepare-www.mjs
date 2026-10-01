import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const out = resolve(root, 'www');
const required = ['index.html', 'css', 'js', 'assets'];

for (const name of required) {
  if (!existsSync(resolve(root, name))) {
    throw new Error(`Missing required web source: ${name}`);
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(resolve(root, 'index.html'), resolve(out, 'index.html'));
cpSync(resolve(root, 'css'), resolve(out, 'css'), { recursive: true });
cpSync(resolve(root, 'js'), resolve(out, 'js'), { recursive: true });
cpSync(resolve(root, 'assets'), resolve(out, 'assets'), { recursive: true });

console.log('Prepared Capacitor web assets in ./www');
