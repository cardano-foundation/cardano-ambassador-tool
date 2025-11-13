'use client';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';

interface RichTextDisplayProps {
  content?: string;
  className?: string;
}

const RichTextDisplay = ({
  content = '',
  className = '',
}: RichTextDisplayProps) => {
  if (!content) {
    return (
      <div className={`text-muted-foreground ${className}`}>Not specified</div>
    );
  }

  const looksLikeHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  const baseClasses = `
    prose prose-sm max-w-none break-words whitespace-normal text-sm font-normal text-foreground
    [overflow-wrap:anywhere] [word-break:break-word]
    [&_ul]:list-disc [&_ul]:ml-6
    [&_ol]:list-decimal [&_ol]:ml-6
    [&_li]:ml-2
    [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4
  `;

  return (
    <div className={`${baseClasses} ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">{children}</p>
          ),
          h1: ({ children }) => (
            <h1 className="mt-6 mb-4 text-2xl font-bold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-3 text-xl font-bold">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-3 text-lg font-bold">{children}</h3>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-2">{children}</li>,
          br: () => <br />,

          img: ({ node, ...props }) => {
            console.log('Image component called:', props);
            return (
              <img
                {...props}
                className="my-4 h-auto max-w-full rounded-lg"
                alt={props.alt || 'Image'}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            );
          },
        }}
        remarkPlugins={[remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        skipHtml={false}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default RichTextDisplay;
