import { onRequestGet, onRequest } from '../functions/api/assets.js';
export async function GET(request) { return onRequestGet({ request }); }
export async function POST() { return onRequest(); }
