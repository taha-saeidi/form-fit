import {config} from '@/lib/env.mjs';
import {googleReady} from '@/lib/google-auth.mjs';export const dynamic='force-dynamic';export async function GET(){return Response.json({google:googleReady(),registration:config.ALLOW_REGISTRATION==='true'},{headers:{'Cache-Control':'no-store'}})}
