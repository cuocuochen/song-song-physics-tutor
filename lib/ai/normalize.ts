/**
 * Normalize student plain-text input to standard physics notation.
 * Students type whatever is easiest — we convert to formal symbols
 * so the AI evaluates meaning, not formatting.
 */

const SYMBOL_MAP: [RegExp, string][] = [
  // Greek letters (common substitutions)
  [/\bu\b(?=\s*[=＝]\s*\d)/g, 'μ'],     // u=0.5 → μ=0.5
  [/\bmu\b/gi, 'μ'],
  [/\btheta\b/gi, 'θ'],
  [/\bth\b(?=\s*[=＝])/gi, 'θ'],         // th=30 → θ=30
  [/\bpi\b/gi, 'π'],
  [/\bomega\b/gi, 'ω'],
  [/\balpha\b/gi, 'α'],
  [/\bbeta\b/gi, 'β'],
  [/\bdelta\b/gi, 'δ'],
  [/\bsigma\b/gi, 'σ'],
  [/\brho\b/gi, 'ρ'],

  // Math operators
  [/\bsqrt\s*\(/gi, '√('],
  [/\bsqrt\b/gi, '√'],

  // Inequality
  [/<=/g, '≤'],
  [/>=/g, '≥'],
  [/!=/g, '≠'],

  // Superscripts
  [/\^2\b/g, '²'],
  [/\^3\b/g, '³'],
  [/\^(\d+)/g, '^$1'], // preserve other superscripts

  // Arrows
  [/->/g, '→'],
  [/<-/g, '←'],

  // Common physics typos
  [/\bfirction\b/gi, 'friction'],
  [/\bfriciton\b/gi, 'friction'],
  [/\bgraivity\b/gi, 'gravity'],
  [/\baccelaration\b/gi, 'acceleration'],

  // Chinese punctuation → neutral
  [/）/g, ')'],
  [/（/g, '('],
  [/：/g, ':'],
  [/，/g, ','],
  [/。/g, '.'],
];

export function normalizeStudentInput(input: string): string {
  let result = input.trim();
  for (const [pattern, replacement] of SYMBOL_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
