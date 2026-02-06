import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(content: string): string {
  const html = marked.parse(content ?? '', { breaks: true, async: false });
  return DOMPurify.sanitize(typeof html === 'string' ? html : '');
}
