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
      className={`prose prose-sm max-w-none break-words whitespace-normal
        [overflow-wrap:anywhere] [word-break:break-word] ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
