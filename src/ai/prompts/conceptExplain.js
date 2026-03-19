/**
 * @param {string} concept - The concept to explain (e.g. "broadcasting", "list comprehensions")
 * @param {'python'|'julia'} language
 * @returns {string} Full prompt text
 */
export function getConceptPrompt(concept, language) {
  return `Explain the ${language} concept of "${concept}" clearly and concisely.

Audience: I know Java and linear algebra but am new to ${language}. Draw analogies to Java or math where helpful.

Format:
1. **One-sentence definition** — what it is
2. **Why it matters** — when and why you'd use it (especially in scientific computing)
3. **Runnable example** — a short, self-contained code snippet I can paste into a REPL right now
4. **Java analogy** (if applicable) — how it maps to something I already know

Keep the total response under 200 words. Make the code example copy-paste ready.`;
}
