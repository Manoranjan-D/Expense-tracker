// Supabase Edge Function: parse-receipt
//
// Receives { bucket, path } for an uploaded receipt image, downloads it with
// the service role, runs OCR, and returns { amount, expense_date, merchant }.
//
// OCR provider: Google Cloud Vision (DOCUMENT_TEXT_DETECTION) when the
// GOOGLE_VISION_API_KEY secret is set. If it is not set, a deterministic mock
// parser runs instead so the app works end-to-end without OCR billing.
//
// Deploy:  supabase functions deploy parse-receipt
// Secret:  supabase secrets set GOOGLE_VISION_API_KEY=...   (optional)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ParsedReceipt {
  amount: number | null;
  expense_date: string | null;
  merchant: string | null;
  mock?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bucket, path } = await req.json();
    if (!bucket || !path) {
      return json({ error: 'bucket and path are required' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: file, error } = await supabase.storage
      .from(bucket)
      .download(path);
    if (error || !file) {
      return json({ error: 'Could not download receipt' }, 404);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY');

    let parsed: ParsedReceipt;
    if (apiKey) {
      const text = await runGoogleVision(bytes, apiKey);
      parsed = parseFields(text);
    } else {
      parsed = mockParse(bytes);
    }

    return json(parsed, 200);
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      500,
    );
  }
});

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// --- Google Cloud Vision ----------------------------------------------------
async function runGoogleVision(
  bytes: Uint8Array,
  apiKey: string,
): Promise<string> {
  const base64 = base64Encode(bytes);
  const res = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64 },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
          },
        ],
      }),
    },
  );
  const data = await res.json();
  return data?.responses?.[0]?.fullTextAnnotation?.text ?? '';
}

// --- Shared parsing of OCR text into fields --------------------------------
function parseFields(text: string): ParsedReceipt {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    amount: extractAmount(lines),
    expense_date: extractDate(text),
    merchant: extractMerchant(lines),
  };
}

function extractAmount(lines: string[]): number | null {
  const numberRe = /(\d{1,3}(?:[,\d]{0,12})(?:\.\d{1,2})?)/;
  // Prefer a line that mentions a total-like keyword.
  const totalLine = lines
    .filter((l) => /(grand\s*total|total|amount due|balance)/i.test(l))
    .filter((l) => !/sub\s*total/i.test(l))
    .pop();
  if (totalLine) {
    const m = totalLine.match(numberRe);
    if (m) return toNumber(m[1]);
  }
  // Fallback: the largest currency-looking number on the receipt.
  let max: number | null = null;
  for (const line of lines) {
    const matches = line.match(/\d{1,3}(?:[,\d]{0,12})(?:\.\d{1,2})/g);
    if (!matches) continue;
    for (const raw of matches) {
      const n = toNumber(raw);
      if (n != null && (max == null || n > max)) max = n;
    }
  }
  return max;
}

function extractDate(text: string): string | null {
  // ISO: 2026-06-20
  const iso = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (iso) return normalize(+iso[1], +iso[2], +iso[3]);

  // DMY / MDY: 20/06/2026 or 06/20/2026 — assume DMY when first part > 12.
  const dmy = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
  if (dmy) {
    const a = +dmy[1];
    const b = +dmy[2];
    const year = +dmy[3];
    const day = a > 12 ? a : b;
    const month = a > 12 ? b : a;
    return normalize(year, month, day);
  }

  // "Jun 20, 2026" / "20 Jun 2026"
  const months =
    'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';
  const named = text.match(
    new RegExp(`\\b(\\d{1,2})\\s*(${months})[a-z]*\\s*,?\\s*(20\\d{2})`, 'i'),
  );
  if (named) {
    return normalize(+named[3], monthIndex(named[2]), +named[1]);
  }
  const named2 = text.match(
    new RegExp(`\\b(${months})[a-z]*\\s*(\\d{1,2}),?\\s*(20\\d{2})`, 'i'),
  );
  if (named2) {
    return normalize(+named2[3], monthIndex(named2[1]), +named2[2]);
  }
  return null;
}

function extractMerchant(lines: string[]): string | null {
  // Use the first informative line near the top that isn't a number/date.
  for (const line of lines.slice(0, 5)) {
    if (/^\d/.test(line)) continue;
    if (/(receipt|invoice|gst|tax|tel|phone)/i.test(line)) continue;
    if (line.length < 2) continue;
    return line.slice(0, 60);
  }
  return lines[0] ?? null;
}

// --- Mock parser (no API key) ----------------------------------------------
function mockParse(bytes: Uint8Array): ParsedReceipt {
  // Deterministic-ish demo values derived from the image so the pre-fill flow
  // is visible without a configured OCR provider.
  const amount = Math.round((100 + (bytes.length % 900)) * 100) / 100;
  const now = new Date();
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}`;
  return { amount, expense_date: date, merchant: 'Sample Merchant', mock: true };
}

// --- helpers ----------------------------------------------------------------
function toNumber(raw: string): number | null {
  const n = parseFloat(raw.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function normalize(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function monthIndex(name: string): number {
  const months = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  ];
  return months.indexOf(name.slice(0, 3).toLowerCase()) + 1;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function base64Encode(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
