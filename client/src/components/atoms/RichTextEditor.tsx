'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, 
  Italic, 
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  Strikethrough,
  Droplet,
  Pilcrow,
  Highlighter,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  IndentIncrease,
  IndentDecrease
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] w-full',
      },
    },
    immediatelyRender: false,
  });

  const insertSmiley = () => {
    editor?.commands.insertContent('😊');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative w-full rounded-md border px-3 py-3 transition-colors text-sm leading-none font-normal bg-background border-border pt-10">
        <div className="absolute top-2 left-2 right-2 z-10 bg-white border border-border/60 rounded-md shadow-sm p-1">
          <div className="flex flex-wrap items-center gap-1">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="min-h-[100px] w-full">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="relative w-full rounded-md border border-border bg-background rounded-md border px-3 py-6 transition-colors text-base leading-none bg-background  border-border placeholder:text-muted-foreground/60 focus-within:border-primary-300 focus-within:ring-primary-300/20 focus-within:ring-1 focus-within:outline-none hover:border-primary-300">
      <div className="border border-border p-2 flex flex-wrap lg:flex-nowrap items-center gap-1 rounded-md shadow-md lg:gap-0 lg:justify-between">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-muted ${editor.isActive('bold') ? 'bg-muted' : ''}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-muted ${editor.isActive('italic') ? 'bg-muted' : ''}`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-muted ${editor.isActive('underline') ? 'bg-muted' : ''}`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-muted ${editor.isActive('strike') ? 'bg-muted' : ''}`}
            title="Strike Through"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="p-2 rounded hover:bg-muted opacity-50"
            title="Text Color (Coming Soon)"
            disabled
          >
            <Droplet className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            className="p-2 rounded hover:bg-muted opacity-50"
            title="Background Color (Coming Soon)"
            disabled
          >
            <Highlighter className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={insertSmiley}
            className="p-2 rounded hover:bg-muted"
            title="Insert Smiley"
          >
            <Smile className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="p-2 rounded hover:bg-muted opacity-50"
            title="Paragraph Format (Coming Soon)"
            disabled
          >
            <Pilcrow className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-muted ${editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-muted ${editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-muted ${editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-muted ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-muted ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            className="p-2 rounded hover:bg-muted"
            title="Indent"
          >
            <IndentIncrease className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            className="p-2 rounded hover:bg-muted"
            title="Outdent"
          >
            <IndentDecrease className="w-4 h-4" />
          </button>
        </div>
      
        <EditorContent 
          editor={editor} 
          className="min-h-[120px] w-full p-3 focus:outline-none text-sm"
        />
    </div>
  );
};

export default RichTextEditor;