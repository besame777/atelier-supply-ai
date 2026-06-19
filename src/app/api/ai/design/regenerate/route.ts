/**
 * POST /api/ai/design/regenerate
 *
 * Same payload as /generate plus the next `variant` number. If a room photo is
 * re-sent (multipart), regeneration runs in redesign mode; otherwise it
 * produces another parameters-based variation. Runs the active image provider
 * (with mock fallback) and returns the design generation result as JSON.
 */
import { NextResponse, type NextRequest } from "next/server";
import { parseGenerationRequest, runGeneration } from "@/lib/ai/design-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // TODO (production cost protection): same as /generate — regeneration is also a
  // paid OpenAI call and must be rate-limited / budget-capped server-side.
  const parsed = await parseGenerationRequest(req);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.code }, { status: parsed.status });
  }

  try {
    const result = await runGeneration(parsed.input, "regenerate");
    return NextResponse.json(result);
  } catch (err) {
    console.error("[ai/design/regenerate] unexpected failure:", err);
    return NextResponse.json({ error: "generation_failed" }, { status: 502 });
  }
}
