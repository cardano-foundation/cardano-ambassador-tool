interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay = ({ content, className = '' }: RichTextDisplayProps) => {
  if (!content) {
    return <div className={`text-muted-foreground ${className}`}>Not specified</div>;
  }

  return (
    <div
      className={`
        prose prose-sm max-w-none break-words whitespace-normal text-sm font-normal text-foreground
        [overflow-wrap:anywhere] [word-break:break-word]
        [&_ul]:list-disc [&_ul]:ml-6
        [&_ol]:list-decimal [&_ol]:ml-6
        [&_li]:ml-2
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};


export default RichTextDisplay;
