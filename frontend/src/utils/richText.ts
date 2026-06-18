const ALLOWED_TAGS = new Set(['strong', 'em', 'span', 'br']);
const BLOCK_TAGS = new Set(['div', 'p', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
// Chrome's execCommand('bold') inserts <b>, execCommand('italic') inserts <i> — normalize them
const TAG_MAP: Record<string, string> = { b: 'strong', i: 'em' };

function cleanNode(node: Node, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return node.cloneNode();

  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as Element;
  const rawTag = el.tagName.toLowerCase();
  const tag = TAG_MAP[rawTag] ?? rawTag;

  if (BLOCK_TAGS.has(tag)) {
    // Convert block elements to their children + a trailing <br> (to preserve line breaks)
    const frag = doc.createDocumentFragment();
    node.childNodes.forEach((child) => {
      const cleaned = cleanNode(child, doc);
      if (cleaned) frag.appendChild(cleaned);
    });
    // Only add <br> if this block has content (not just an empty wrapper)
    const hasContent = frag.childNodes.length > 0;
    if (hasContent) frag.appendChild(doc.createElement('br'));
    return frag;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    // Unwrap — keep children
    const frag = doc.createDocumentFragment();
    node.childNodes.forEach((child) => {
      const cleaned = cleanNode(child, doc);
      if (cleaned) frag.appendChild(cleaned);
    });
    return frag;
  }

  const newEl = doc.createElement(tag);

  // Only allow class="cursive-text" on spans, nothing else
  if (tag === 'span' && el.classList.contains('cursive-text')) {
    newEl.className = 'cursive-text';
  }

  node.childNodes.forEach((child) => {
    const cleaned = cleanNode(child, doc);
    if (cleaned) newEl.appendChild(cleaned);
  });

  return newEl;
}

export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out = document.createElement('div');
  const children = Array.from(doc.body.childNodes);
  children.forEach((child, i) => {
    const isBlock = child.nodeType === Node.ELEMENT_NODE &&
      BLOCK_TAGS.has((child as Element).tagName.toLowerCase());
    // If a block follows inline/text content, ensure there's a separator
    if (isBlock && i > 0) {
      const prev = children[i - 1];
      const prevIsBlock = prev.nodeType === Node.ELEMENT_NODE &&
        BLOCK_TAGS.has((prev as Element).tagName.toLowerCase());
      if (!prevIsBlock) {
        // Previous sibling was inline/text — the block will add its own <br>,
        // but the inline content before it needs a <br> too
        out.appendChild(document.createElement('br'));
      }
    }
    const cleaned = cleanNode(child, document);
    if (cleaned) out.appendChild(cleaned);
  });
  // Trim trailing <br> that block-conversion adds after the last block
  let result = out.innerHTML;
  result = result.replace(/(<br\s*\/?>)+$/, '');
  return result;
}

export function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

export function isRichText(text: string): boolean {
  return /<(strong|em|span)[^>]*>/i.test(text);
}
