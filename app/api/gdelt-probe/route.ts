import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function probe(query: string, timespan: string) {
  const url =
    'https://api.gdeltproject.org/api/v2/doc/doc?query=' +
    encodeURIComponent(query) +
    '&mode=timelinevol&format=json&timespan=' +
    timespan;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; 18btc-probe/1.0)' },
      cache: 'no-store',
    });
    const text = await res.text();
    return { status: res.status, head: text.slice(0, 600) };
  } catch (e) {
    return { status: -1, head: String(e).slice(0, 300) };
  }
}

export async function GET() {
  const q1 = await probe('"利空出尽"', '3m');
  await sleep(7000);
  const q2 = await probe('bitcoin', '1m');
  return NextResponse.json({ q1_likong_3m: q1, q2_bitcoin_1m: q2, at: new Date().toISOString() });
}
