import { executionManager } from '../engines/executionManager.js';

/**
 * Normalise stdout for comparison:
 * - Trim leading/trailing whitespace
 * - Normalise line endings
 */
function normalise(s) {
  return s.replace(/\r\n/g, '\n').trim();
}

/**
 * Build the code to execute for a single test case.
 * The user's code is run first; then appendCode is appended.
 *
 * @param {string} userCode
 * @param {string} appendCode
 * @returns {string}
 */
function buildCode(userCode, appendCode) {
  if (!appendCode) return userCode;
  return `${userCode}\n${appendCode}`;
}

/**
 * Run a single test case and return pass/fail.
 *
 * @param {string} userCode
 * @param {import('../curriculum/schema').TestCase} testCase
 * @param {string} language  'python' | 'julia'
 * @returns {Promise<{ id: string, passed: boolean, actual: string, expected: string, error: string | null }>}
 */
async function runSingle(userCode, testCase, language) {
  const code = buildCode(userCode, testCase.appendCode);
  let stdout = '';
  let stderr = '';

  try {
    await executionManager.execute(language, code, {
      onStdout: (text) => { stdout += text; },
      onStderr: (text) => { stderr += text; },
    });
  } catch (err) {
    return {
      id: testCase.id,
      passed: false,
      actual: '',
      expected: testCase.expectedOutput,
      error: err.message,
    };
  }

  const actual   = normalise(stdout);
  const expected = normalise(testCase.expectedOutput);
  const passed   = actual === expected;

  return {
    id: testCase.id,
    passed,
    actual,
    expected,
    error: passed ? null : (stderr || null),
  };
}

/**
 * Run all test cases for a challenge sequentially.
 *
 * @param {string} userCode
 * @param {import('../curriculum/schema').TestCase[]} testCases
 * @param {string} language
 * @param {(result: object, index: number) => void} [onResult]  called after each test
 * @returns {Promise<Array<{ id: string, passed: boolean, actual: string, expected: string, error: string | null }>>}
 */
export async function runTests(userCode, testCases, language, onResult) {
  const results = [];
  for (let i = 0; i < testCases.length; i++) {
    const result = await runSingle(userCode, testCases[i], language);
    results.push(result);
    onResult?.(result, i);
  }
  return results;
}
