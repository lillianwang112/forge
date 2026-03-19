import puter from '@heyputer/puter.js';
import { getModel } from './modelConfig.js';
import { getPythonReviewPrompt } from './prompts/pythonReview.js';
import { getJuliaReviewPrompt } from './prompts/juliaReview.js';
import { getHintPrompt } from './prompts/hintGeneration.js';
import { getConceptPrompt } from './prompts/conceptExplain.js';

export class FeedbackEngine {
  /**
   * Get a streaming code review for Python or Julia code.
   * @param {string} code
   * @param {'python'|'julia'} language
   * @param {{ title: string, description: string } | null} challengeContext
   * @returns {Promise<AsyncIterable>} Puter.js streaming response
   */
  async getCodeReview(code, language, challengeContext = null) {
    const prompt =
      language === 'julia'
        ? getJuliaReviewPrompt(code, challengeContext)
        : getPythonReviewPrompt(code, challengeContext);

    const messages = [{ role: 'user', content: prompt }];

    return puter.ai.chat(messages, {
      model: getModel('detailed'),
      stream: true,
    });
  }

  /**
   * Get a progressive hint for a coding challenge.
   * @param {{ title: string, description: string, language: string }} challenge
   * @param {1|2|3} hintLevel
   * @param {string} userCode
   * @returns {Promise<AsyncIterable>}
   */
  async getHint(challenge, hintLevel, userCode) {
    const prompt = getHintPrompt(challenge, hintLevel, userCode);
    const messages = [{ role: 'user', content: prompt }];

    return puter.ai.chat(messages, {
      model: getModel('quick'),
      stream: true,
    });
  }

  /**
   * Explain a language concept with a runnable example.
   * @param {string} concept
   * @param {'python'|'julia'} language
   * @returns {Promise<AsyncIterable>}
   */
  async explainConcept(concept, language) {
    const prompt = getConceptPrompt(concept, language);
    const messages = [{ role: 'user', content: prompt }];

    return puter.ai.chat(messages, {
      model: getModel('detailed'),
      stream: true,
    });
  }
}

export const feedbackEngine = new FeedbackEngine();
