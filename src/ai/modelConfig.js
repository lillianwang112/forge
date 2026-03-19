// Per project instructions: use 'claude-sonnet-4-6' as the Puter.js model string
const MODELS = {
  primary: 'claude-sonnet-4-6',
  codeFallback: 'gpt-5.3-codex',
  fast: 'google/gemini-2.5-flash',
};

/**
 * @param {'detailed'|'quick'|'code'} mode
 * @returns {string} Puter.js model identifier
 */
export function getModel(mode) {
  switch (mode) {
    case 'detailed': return MODELS.primary;      // Claude for nuanced review
    case 'quick':    return MODELS.fast;          // Gemini for rapid checks
    case 'code':     return MODELS.codeFallback;  // Codex for code-focused
    default:         return MODELS.primary;
  }
}

export { MODELS };
