// Vercel wrapper. Same logic as the Cloudflare Pages function; keys come from Vercel env vars only (never in the repo).
import { onRequestPost, onRequest } from '../functions/api/coach.js';
export async function POST(request) { return onRequestPost({ request, env: process.env }); }
export async function GET() { return onRequest(); }
