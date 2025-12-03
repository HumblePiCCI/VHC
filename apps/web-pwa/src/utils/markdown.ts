import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(content: string): string {
  const html = marked.parse(content ?? '', { breaks: true });
  return DOMPurify.sanitize(html);
}
