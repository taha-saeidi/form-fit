import {spawnSync} from 'node:child_process';import {createRequire} from 'node:module';import {dirname,resolve} from 'node:path';
const [email,scope]=process.argv.slice(2);if(!email||! /^[a-zA-Z0-9._+@-]+$/.test(email)||!email.includes('@')||!['--local','--remote'].includes(scope))throw Error('Usage: node scripts/admin.mjs EMAIL --local|--remote');
const require=createRequire(import.meta.url),cli=resolve(dirname(require.resolve('wrangler/package.json')),'bin/wrangler.js');
const sql="UPDATE auth_accounts SET role='admin' WHERE email='"+email.toLowerCase()+"'; SELECT email,role FROM auth_accounts WHERE email='"+email.toLowerCase()+"';";
const r=spawnSync(process.execPath,[cli,'d1','execute','DB',scope,'--command',sql],{stdio:'inherit'});process.exit(r.status??1);
