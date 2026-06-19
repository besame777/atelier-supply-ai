/**
 * Provider selection (server-only).
 *
 * Returns the configured image provider, falling back to mock when OpenAI is
 * selected but no API key is present. Route handlers additionally fall back to
 * mock at call time if a real provider throws.
 */
import { mockImageProvider } from "./mock-provider";
import { openAiImageProvider } from "./openai-image-provider";
import type { ImageProvider } from "./types";

export * from "./types";
export { mockImageProvider } from "./mock-provider";
export { openAiImageProvider } from "./openai-image-provider";

/** True when OpenAI image generation is both selected and usable (key present). */
export function isOpenAIImageEnabled(): boolean {
  const selected = (process.env.AI_IMAGE_PROVIDER || "mock").toLowerCase();
  return selected === "openai" && Boolean(process.env.OPENAI_API_KEY);
}

/** The active image provider for this request. */
export function getImageProvider(): ImageProvider {
  return isOpenAIImageEnabled() ? openAiImageProvider : mockImageProvider;
}

/** Text provider is mock-only for now — architecture placeholder for later. */
export function getTextProvider(): "mock" {
  return "mock";
}
