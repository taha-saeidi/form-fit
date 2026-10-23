import {env} from "cloudflare:workers";export const config=env;export const database=()=>env.DB;
