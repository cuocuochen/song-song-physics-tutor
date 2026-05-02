/**
 * Extracts JSON from AI response, stripping markdown fences and leading text.
 */
export function parseAIResponse(raw: string): Record<string, unknown> {
  let cleaned = raw.trim();

  // Strip markdown code fences
  if (cleaned.startsWith('```')) {
    const firstNewline = cleaned.indexOf('\n');
    cleaned = cleaned.slice(firstNewline + 1);
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();
  }

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON object in text
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // fall through
      }
    }
  }

  throw new Error('Failed to parse JSON from AI response');
}
