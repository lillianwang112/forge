/**
 * Curriculum data types for Forge.
 *
 * @typedef {Object} TestCase
 * @property {string} id
 * @property {string} description
 * @property {string} appendCode  - code appended to user's submission before running
 * @property {string} expectedOutput - normalized stdout to match against
 * @property {boolean} isHidden   - hide from learner until after attempt
 */

/**
 * @typedef {Object} Challenge
 * @property {string} id
 * @property {string} title
 * @property {string} description  - markdown
 * @property {string} starterCode
 * @property {TestCase[]} testCases
 */

/**
 * @typedef {Object} Lesson
 * @property {string} id
 * @property {string} title
 * @property {number} order
 * @property {string} content       - markdown lesson body
 * @property {string} starterCode   - code shown in sandbox when lesson is opened
 * @property {Challenge[]} challenges
 */

/**
 * @typedef {Object} Track
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {string} language      - 'python' | 'julia' | 'shared'
 * @property {string} color         - CSS variable or rgba
 * @property {string} bgColor
 * @property {string} borderColor
 * @property {string} description
 * @property {Lesson[]} lessons
 */
