'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay = ({ content, className = '' }: RichTextDisplayProps) => {
  if (!content) {
    return <div className={`text-muted-foreground ${className}`}>Not specified</div>;
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

  if (looksLikeHTML) {
    return (
      <div
        className={`${baseClasses} ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      <ReactMarkdown
        components={{
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="max-w-full h-auto rounded-lg my-4"
              alt={props.alt || 'Image'}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default RichTextDisplay;
