import { useState, useCallback } from 'react';
import SplitPane from '../editor/SplitPane';
import CodeEditor from '../editor/CodeEditor';
import RightPanel from '../editor/RightPanel';
import EditorToolbar from '../editor/EditorToolbar';
import ChallengeCard from './ChallengeCard';
import MarkdownRenderer from '../shared/MarkdownRenderer';
import { useCodeExecution } from '../../hooks/useCodeExecution';
import { useAIFeedback } from '../../hooks/useAIFeedback';
import { runTests } from '../../utils/testRunner';

/**
 * @param {{
 *   lesson: import('../../curriculum/schema').Lesson,
 *   trackId: string,
 *   trackColor: string,
 *   language: string,
 *   isLessonComplete: boolean,
 *   isChallengeComplete: (challengeId: string) => boolean,
 *   getTestResults: (lessonId: string, challengeId: string) => Array,
 *   onCompleteChallenge: (challengeId: string, results: Array) => Promise<boolean>,
 *   onCompleteLesson: () => void,
 * }} props
 */
export default function LessonView({
  lesson,
  trackId,
  trackColor,
  language,
  isLessonComplete,
  isChallengeComplete,
  getTestResults,
  onCompleteChallenge,
  onCompleteLesson,
}) {
  const [selectedChallengeIdx, setSelectedChallengeIdx] = useState(0);
  const [code, setCode] = useState(() => lesson.challenges[0]?.starterCode ?? lesson.starterCode);
  const [testResults, setTestResults] = useState({}); // { challengeId: result[] }
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testError, setTestError] = useState(null);

  const selectedChallenge = lesson.challenges[selectedChallengeIdx];

  // Code execution (for sandbox run)
  const { execute, output, isRunning, engineStatus, loadingMessage, clearOutput } =
    useCodeExecution(language);

  // AI feedback
  const { requestReview, feedback, isStreaming, error: aiError, clearFeedback } =
    useAIFeedback();

  const handleSelectChallenge = (idx) => {
    setSelectedChallengeIdx(idx);
    setCode(lesson.challenges[idx].starterCode);
    clearOutput();
    clearFeedback();
    setTestError(null);
  };

  const handleRun = () => execute(code, language);

  const handleReset = () => {
    setCode(selectedChallenge?.starterCode ?? lesson.starterCode);
    clearOutput();
  };

  const handleAIFeedback = useCallback(() => {
    requestReview(code, language);
  }, [code, language, requestReview]);

  // Run all test cases for the selected challenge
  const handleRunTests = useCallback(async () => {
    if (!selectedChallenge || isTestRunning) return;
    setIsTestRunning(true);
    setTestError(null);
    clearOutput();

    const liveResults = [];
    try {
      await runTests(
        code,
        selectedChallenge.testCases,
        language,
        (result) => {
          liveResults.push(result);
          setTestResults((prev) => ({
            ...prev,
            [selectedChallenge.id]: [...liveResults],
          }));
        }
      );
      const allPassed = await onCompleteChallenge(selectedChallenge.id, liveResults);
      // If all challenges in lesson now complete, mark lesson done
      if (allPassed) {
        const allChallengesDone = lesson.challenges.every((c, i) => {
          if (i === selectedChallengeIdx) return allPassed;
          return isChallengeComplete(lesson.id + ':' + c.id);
        });
        // Let parent decide — pass results up
      }
    } catch (err) {
      setTestError(err.message);
    } finally {
      setIsTestRunning(false);
    }
  }, [code, selectedChallenge, language, isTestRunning, onCompleteChallenge, lesson, selectedChallengeIdx, isChallengeComplete, clearOutput]);

  const currentTestResults = testResults[selectedChallenge?.id] ?? getTestResults(lesson.id, selectedChallenge?.id ?? '');
  const visibleTestCases   = selectedChallenge?.testCases.filter(tc => !tc.isHidden) ?? [];
  const passedCount        = currentTestResults.filter(r => r.passed).length;
  const totalVisible       = visibleTestCases.length;
  const allPassed          = currentTestResults.length > 0 && currentTestResults.every(r => r.passed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <SplitPane
        defaultRatio={0.38}
        storageKey={`lesson-split-${lesson.id}`}
        left={
          /* Left: lesson content + challenge list */
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--bg-secondary)',
            }}
          >
            {/* Lesson markdown */}
            <div style={{ padding: '20px 20px 0', flex: 'none' }}>
              <MarkdownRenderer content={lesson.content} />
            </div>

            {/* Challenge section */}
            <div
              style={{
                padding: '0 20px 20px',
                marginTop: 24,
                flex: 'none',
              }}
            >
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 10,
                  marginTop: 0,
                }}
              >
                Challenges
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lesson.challenges.map((challenge, idx) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isSelected={idx === selectedChallengeIdx}
                    isComplete={isChallengeComplete(challenge.id)}
                    testResults={
                      testResults[challenge.id] ??
                      getTestResults(lesson.id, challenge.id)
                    }
                    onSelect={() => handleSelectChallenge(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        }
        right={
          /* Right: editor + output */
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Challenge description header */}
            {selectedChallenge && (
              <div
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderBottom: '1px solid var(--border)',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {selectedChallenge.title}
                  </span>
                  <span style={{ flex: 1 }} />
                  {/* Run Tests button */}
                  <button
                    onClick={handleRunTests}
                    disabled={isTestRunning || isRunning}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 12px',
                      borderRadius: 6,
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      cursor: isTestRunning || isRunning ? 'not-allowed' : 'pointer',
                      border: 'none',
                      backgroundColor: allPassed
                        ? 'rgba(63,185,80,0.2)'
                        : isTestRunning
                        ? 'rgba(163,113,247,0.2)'
                        : 'rgba(163,113,247,0.15)',
                      color: allPassed
                        ? 'var(--accent-green)'
                        : isTestRunning
                        ? 'var(--accent-purple)'
                        : 'var(--accent-purple)',
                      opacity: (isTestRunning || isRunning) ? 0.7 : 1,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isTestRunning && !isRunning) {
                        e.currentTarget.style.backgroundColor = 'rgba(163,113,247,0.28)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = allPassed
                        ? 'rgba(63,185,80,0.2)'
                        : 'rgba(163,113,247,0.15)';
                    }}
                  >
                    {isTestRunning ? (
                      <>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            border: '1.5px solid rgba(163,113,247,0.3)',
                            borderTopColor: 'var(--accent-purple)',
                            borderRadius: '50%',
                            animation: 'spin 0.65s linear infinite',
                          }}
                        />
                        Testing…
                      </>
                    ) : allPassed ? (
                      '✓ Tests passed'
                    ) : (
                      '▶ Run Tests'
                    )}
                  </button>
                </div>

                {/* Test results summary */}
                {currentTestResults.length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 4,
                    }}
                  >
                    {visibleTestCases.map((tc, i) => {
                      const r = currentTestResults.find(x => x.id === tc.id);
                      const passed = r?.passed;
                      const pending = !r;
                      return (
                        <span
                          key={tc.id}
                          title={tc.description}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '2px 7px',
                            borderRadius: 8,
                            fontSize: '0.65rem',
                            fontFamily: 'var(--font-mono)',
                            backgroundColor: pending
                              ? 'var(--bg-elevated)'
                              : passed
                              ? 'rgba(63,185,80,0.12)'
                              : 'rgba(248,81,73,0.12)',
                            color: pending
                              ? 'var(--text-muted)'
                              : passed
                              ? 'var(--accent-green)'
                              : 'var(--accent-red)',
                            border: `1px solid ${
                              pending ? 'var(--border)' : passed ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'
                            }`,
                          }}
                        >
                          {pending ? '…' : passed ? '✓' : '✗'} T{i + 1}
                        </span>
                      );
                    })}
                    {testError && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--accent-red)',
                          fontFamily: 'var(--font-body)',
                          marginLeft: 4,
                        }}
                      >
                        {testError}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Toolbar */}
            <EditorToolbar
              language={language}
              onLanguageChange={null}
              onRun={handleRun}
              onReset={handleReset}
              onAIFeedback={handleAIFeedback}
              isRunning={isRunning}
              isStreaming={isStreaming}
              engineStatus={engineStatus}
              hideLangToggle
            />

            {/* Editor + Output */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <SplitPane
                direction="vertical"
                defaultRatio={0.55}
                storageKey={`lesson-editor-split-${lesson.id}`}
                left={
                  <CodeEditor
                    language={language}
                    value={code}
                    onChange={setCode}
                    onRun={handleRun}
                  />
                }
                right={
                  <RightPanel
                    output={output}
                    isRunning={isRunning}
                    engineStatus={engineStatus}
                    loadingMessage={loadingMessage}
                    language={language}
                    onClearOutput={clearOutput}
                    feedback={feedback}
                    isStreaming={isStreaming}
                    aiError={aiError}
                    onRetry={handleAIFeedback}
                    onClearFeedback={clearFeedback}
                  />
                }
              />
            </div>
          </div>
        }
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
