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

  // Debug logging for image content
  if (content.includes('data:image')) {
    console.log('Content contains base64 images:', {
      contentLength: content.length,
      imageCount: (content.match(/!\[.*?\]\(data:image/g) || []).length,
      preview: content.substring(0, 200) + '...'
    });
  }

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
            const { src, alt, ...restProps } = props;
  
            
            return (
              <img
                {...restProps}
                src={src}
                className="my-4 h-auto max-w-full rounded-lg border"
                alt={alt || 'Image'}
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  display: 'block'
                }}
           
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
          
                  
                  
                  // Show a placeholder for failed images
                  target.style.border = '2px dashed #e5e7eb';
                  target.style.background = '#f9fafb';
                  target.style.padding = '2rem';
                  target.style.textAlign = 'center';
                  target.style.color = '#6b7280';
                  target.style.minHeight = '100px';
                  target.style.display = 'flex';
                  target.style.alignItems = 'center';
                  target.style.justifyContent = 'center';
                  
                  // Create a text node showing the error
                  const errorDiv = document.createElement('div');
                  errorDiv.innerHTML = `<div style="text-align: center;"><div>🖼️</div><div style="margin-top: 8px; font-size: 14px;">Image failed to load</div><div style="margin-top: 4px; font-size: 12px; opacity: 0.7;">${alt || 'No alt text'}</div></div>`;
                  target.style.display = 'none';
                  target.parentNode?.insertBefore(errorDiv, target);
                }}
                loading="lazy"

                {...(typeof src === 'string' && !src.startsWith('data:') && { crossOrigin: 'anonymous' })}
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
