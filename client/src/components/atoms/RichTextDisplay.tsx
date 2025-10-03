interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay = ({ content, className = '' }: RichTextDisplayProps) => {
  if (!content) {
    return (
      <div className={`text-muted-foreground ${className}`}>Not specified</div>
    );
  }

  return (
    <div
      className={`prose prose-sm text-foreground max-w-none text-sm font-normal [overflow-wrap:anywhere] [word-break:break-word] whitespace-normal [&_li]:ml-2 [&_ol]:ml-6 [&_ol]:list-decimal [&_ul]:ml-6 [&_ul]:list-disc ${className} `}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextDisplay;
