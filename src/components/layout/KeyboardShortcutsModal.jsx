import Modal from '../shared/Modal';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform);
const mod   = isMac ? '⌘' : 'Ctrl';

const SHORTCUTS = [
  { section: 'Editor' },
  { keys: [`${mod}↩`],         desc: 'Run code'             },
  { keys: [`${mod}⇧F`],        desc: 'Get AI feedback'      },
  { keys: [`${mod}S`],         desc: 'Save code snapshot'   },
  { keys: [`${mod}/`],         desc: 'Toggle line comment'  },

  { section: 'Review' },
  { keys: ['Space'],            desc: 'Reveal card answer'  },
  { keys: ['1'],                desc: 'Rate: Again'         },
  { keys: ['2'],                desc: 'Rate: Hard'          },
  { keys: ['3'],                desc: 'Rate: Good'          },
  { keys: ['4'],                desc: 'Rate: Easy'          },

  { section: 'Navigation' },
  { keys: ['?'],                desc: 'Show this modal'     },
  { keys: ['Esc'],              desc: 'Close modal / panel' },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth={440}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SHORTCUTS.map((item, i) => {
          if (item.section) {
            return (
              <div
                key={i}
                style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.09em',
                  padding: '10px 0 4px',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: 2,
                }}
              >
                {item.section}
              </div>
            );
          }
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 0',
              }}
            >
              <span
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {item.desc}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {item.keys.map((k) => (
                  <kbd
                    key={k}
                    style={{
                      display: 'inline-block',
                      padding: '2px 7px',
                      borderRadius: 5,
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      boxShadow: '0 1px 0 var(--border)',
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
