/**
 * Lightweight Markdown → React renderer.
 * Handles: fenced code blocks, ## headers, **bold**, `inline code`, paragraphs.
 * No external deps — intentionally minimal for the Forge use case.
 */

/** Render inline markdown: **bold** and `code` */
function renderInline(text, key) {
  // Split on **bold** and `code` spans
  const parts = [];
  const pattern = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let last = 0;
  let m;

  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[0].startsWith('**')) {
      parts.push(
        <strong key={`b-${m.index}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {m[2]}
        </strong>
      );
    } else {
      parts.push(
        <code
          key={`c-${m.index}`}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8em',
            backgroundColor: 'rgba(88,166,255,0.1)',
            color: 'var(--accent-blue)',
            padding: '1px 5px',
            borderRadius: 3,
          }}
        >
          {m[3]}
        </code>
      );
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return <span key={key}>{parts}</span>;
}

/** Parse the markdown string into an array of block descriptors */
function parseBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.trim().replace(/^```/, '').trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      i++; // skip closing ```
      continue;
    }

    // ## Heading (h2)
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', content: line.slice(3) });
      i++;
      continue;
    }

    // ### Heading (h3)
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', content: line.slice(4) });
      i++;
      continue;
    }

    // Numbered list item
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Bullet list item
    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph — collect consecutive non-special lines
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('##') &&
      !lines[i].trimStart().startsWith('```') &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^[-*]\s/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: 'p', content: paraLines.join(' ') });
    }
  }

  return blocks;
}

export default function MarkdownRenderer({ content = '', style = {} }) {
  if (!content) return null;

  const blocks = parseBlocks(content);

  return (
    <div
      style={{
        fontSize: '0.85rem',
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      {blocks.map((block, bi) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2
                key={bi}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: 'var(--accent-blue)',
                  margin: bi === 0 ? '0 0 8px' : '18px 0 8px',
                  letterSpacing: '-0.01em',
                }}
              >
                {renderInline(block.content, `h2-${bi}`)}
              </h2>
            );

          case 'h3':
            return (
              <h3
                key={bi}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  margin: '14px 0 6px',
                }}
              >
                {renderInline(block.content, `h3-${bi}`)}
              </h3>
            );

          case 'code':
            return (
              <pre
                key={bi}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '10px 14px',
                  margin: '8px 0',
                  overflowX: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre',
                }}
              >
                {block.lang && (
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      marginBottom: 6,
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {block.lang}
                  </span>
                )}
                {block.content}
              </pre>
            );

          case 'ol':
            return (
              <ol
                key={bi}
                style={{
                  paddingLeft: 20,
                  margin: '6px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {block.items.map((item, ii) => (
                  <li key={ii} style={{ color: 'var(--text-secondary)' }}>
                    {renderInline(item, `li-${bi}-${ii}`)}
                  </li>
                ))}
              </ol>
            );

          case 'ul':
            return (
              <ul
                key={bi}
                style={{
                  paddingLeft: 20,
                  margin: '6px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  listStyleType: 'disc',
                }}
              >
                {block.items.map((item, ii) => (
                  <li key={ii} style={{ color: 'var(--text-secondary)' }}>
                    {renderInline(item, `ul-${bi}-${ii}`)}
                  </li>
                ))}
              </ul>
            );

          case 'p':
          default:
            return (
              <p key={bi} style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>
                {renderInline(block.content, `p-${bi}`)}
              </p>
            );
        }
      })}
    </div>
  );
}
