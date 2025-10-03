'use client';

import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Droplet,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Smile,
  Strikethrough,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) => {
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
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[100px] w-full ' +
          'prose-ul:list-disc prose-ol:list-decimal prose-li:ml-6',
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
      <div className="border-border bg-background focus-within:border-primary-300 focus-within:ring-primary-300/20 hover:border-primary-300 relative w-full rounded-md border transition-colors focus-within:ring-1 focus-within:outline-none">
        <div className="border-border/60 absolute top-2 right-2 left-2 z-10 rounded-md border bg-white p-1 shadow-sm">
          <div className="flex flex-wrap items-center gap-1">
            {[...Array(13)].map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
        <div className="min-h-[100px] w-full">
          <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="border-border bg-background  placeholder:text-muted-foreground/60 focus-within:border-primary-300 focus-within:ring-primary-300/20 hover:border-primary-300 relative w-full rounded-md border px-3 py-6 text-base leading-none transition-colors focus-within:ring-1 focus-within:outline-none">
      <div className="border-border flex flex-wrap items-center gap-1 rounded-md border p-2 shadow-md lg:flex-nowrap lg:justify-between lg:gap-0">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`hover:bg-muted rounded p-2 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`hover:bg-muted rounded p-2 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`hover:bg-muted rounded p-2 ${editor.isActive('underline') ? 'bg-muted' : ''}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`hover:bg-muted rounded p-2 ${editor.isActive('strike') ? 'bg-muted' : ''}`}
          title="Strike Through"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="hover:bg-muted rounded p-2 opacity-50"
          title="Text Color (Coming Soon)"
          disabled
        >
          <Droplet className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="hover:bg-muted rounded p-2 opacity-50"
          title="Background Color (Coming Soon)"
          disabled
        >
          <Highlighter className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={insertSmiley}
          className="hover:bg-muted rounded p-2"
          title="Insert Smiley"
        >
          <Smile className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="hover:bg-muted rounded p-2 opacity-50"
          title="Paragraph Format (Coming Soon)"
          disabled
        >
          <Pilcrow className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`hover:bg-muted rounded p-2 ${editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`hover:bg-muted rounded p-2 ${editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`hover:bg-muted rounded p-2 ${editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`hover:bg-muted rounded p-2 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`hover:bg-muted rounded p-2 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          className="hover:bg-muted rounded p-2"
          title="Indent"
        >
          <IndentIncrease className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          className="hover:bg-muted rounded p-2"
          title="Outdent"
        >
          <IndentDecrease className="h-4 w-4" />
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[120px] w-full border-0 p-3 text-sm outline-none focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
