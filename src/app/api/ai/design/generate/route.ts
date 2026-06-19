/**
 * POST /api/ai/design/generate
 *
 * Accepts multipart FormData (with an optional room photo) or JSON.
 * Mode is detected server-side: an uploaded image → room_photo_redesign,
 * otherwise → parameters_to_design. Runs the active image provider (with mock
 * fallback) and returns the design generation result as JSON.
 */
import { NextResponse, type NextRequest } from "next/server";
import { parseGenerationRequest, runGeneration } from "@/lib/ai/design-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // TODO (production cost protection): enforce server-side rate limiting per
  // IP/session/user, a daily OpenAI budget cap, and CAPTCHA/contact capture
  // before this paid call. The client session limit is bypassable. See
  // src/lib/ai/usage-limits.ts and design-service.ts.
  const parsed = await parseGenerationRequest(req);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.code }, { status: parsed.status });
  }

  try {
    const result = await runGeneration(parsed.input, "generate");
    return NextResponse.json(result);
  } catch (err) {
    console.error("[ai/design/generate] unexpected failure:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
