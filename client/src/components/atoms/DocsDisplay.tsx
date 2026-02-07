'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

interface DocsDisplayProps {
  content?: string;
  className?: string;
}

const DocsDisplay = ({
  content = '',
  className = '',
}: DocsDisplayProps) => {
  if (!content) {
    return (
      <div className={`text-muted-foreground ${className}`}>No content available</div>
    );
  }

  const baseClasses = `
    prose prose-sm max-w-none break-words whitespace-normal text-sm font-normal text-foreground
    [overflow-wrap:anywhere] [word-break:break-word]
  `;

  // Helper to extract ID from heading text like "Title {#id}"
  const extractHeadingId = (children: any): { text: any; id?: string } => {
    if (typeof children === 'string') {
      const match = children.match(/^(.*?)\s*\{#([^}]+)\}\s*$/);
      if (match) {
        return { text: match[1].trim(), id: match[2] };
      }
    }
    return { text: children };
  };

  return (
    <div className={`${baseClasses} ${className}`}>
      <ReactMarkdown
        components={{
          // Headings with ID support
          h1: ({ children }) => {
            const { text, id } = extractHeadingId(children);
            return (
              <h1 id={id} className="mt-8 mb-4 text-2xl font-bold text-foreground scroll-mt-20">
                {text}
              </h1>
            );
          },
          h2: ({ children }) => {
            const { text, id } = extractHeadingId(children);
            return (
              <h2 id={id} className="mt-6 mb-3 text-xl font-bold text-foreground border-b border-border pb-2 scroll-mt-20">
                {text}
              </h2>
            );
          },
          h3: ({ children }) => {
            const { text, id } = extractHeadingId(children);
            return (
              <h3 id={id} className="mt-5 mb-3 text-lg font-bold text-foreground scroll-mt-20">
                {text}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="mt-4 mb-2 text-base font-semibold text-foreground">{children}</h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-muted-foreground">{children}</p>
          ),

          // Text formatting
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,

          // Lists
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-muted-foreground">{children}</li>
          ),

          // Links - handle both internal and external
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;

            // Internal links (start with / or #)
            if (href.startsWith('/') || href.startsWith('#')) {
              return (
                <Link 
                  href={href} 
                  className="text-primary-base hover:underline"
                >
                  {children}
                </Link>
              );
            }

            // External links
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-base hover:underline"
              >
                {children}
              </a>
            );
          },

          // Code
          code: ({ node, inline, className, children, ...props }: any) => {
            // Check if it's inline code (no className means inline in most cases)
            const isInline = inline !== false;
            
            if (isInline) {
              return (
                <code className="bg-primary-base/10 border border-primary-base/20 px-2 py-0.5 rounded text-sm font-mono text-primary-base inline-block align-baseline">
                  {children}
                </code>
              );
            }
            
            // Block code
            return (
              <pre className="bg-muted p-4 rounded-lg my-4 overflow-x-auto">
                <code className="text-sm font-mono text-foreground">
                  {children}
                </code>
              </pre>
            );
          },

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4  bg-muted pl-4 py-2 my-4 italic text-amber-900">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="my-8 border-border" />
          ),

          // Line breaks
          br: () => <br />,
        }}
        remarkPlugins={[remarkBreaks, remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        skipHtml={false}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default DocsDisplay;
