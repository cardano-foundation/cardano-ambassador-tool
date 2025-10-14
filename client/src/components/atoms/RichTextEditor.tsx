'use client';

import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Underline as UnderlineIcon,
  Strikethrough,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useEffect, useState, forwardRef, useImperativeHandle, MouseEvent } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = forwardRef(({ value, onChange, placeholder }: RichTextEditorProps, ref) => {
  const [mounted, setMounted] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        breaks: false,
        transformPastedText: false,
        transformCopiedText: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[300px] w-full ' +
          'prose-ul:list-disc prose-ol:list-decimal prose-li:ml-6',
        },
    },
    immediatelyRender: false,
  });

  const onEmojiClick = (emojiData: EmojiClickData) => {
    editor?.commands.insertContent(emojiData.emoji);
    setShowEmojiPicker(false);
  };
  useImperativeHandle(ref, () => ({
    getMarkdown: () => {
      if (!editor) return '';
      return (editor.storage as any).markdown.getMarkdown();
    }
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showEmojiPicker && !target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as any);
    return () => document.removeEventListener('mousedown', handleClickOutside as any);
  }, [showEmojiPicker]);

  if (!mounted) {
    return (
      <div className="relative w-full rounded-md border border-border bg-background transition-colors focus-within:border-primary-300 focus-within:ring-primary-300/20 focus-within:ring-1 focus-within:outline-none hover:border-primary-300">
        <div className="absolute top-2 left-2 right-2 z-10 bg-white border border-border/60 rounded-md shadow-sm p-1">
          <div className="flex flex-wrap items-center gap-1">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="min-h-[300px] w-full">
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

          {/* <button
            type="button"
            className="p-2 rounded hover:bg-muted opacity-50"
            title="Text Color (Coming Soon)"
            disabled
          >
            <Droplet className="w-4 h-4" />
          </button> */}

          {/* <button
            type="button"
            className="p-2 rounded hover:bg-muted opacity-50"
            title="Background Color (Coming Soon)"
            disabled
          >
            <Highlighter className="w-4 h-4" />
          </button> */}

          <div className="emoji-picker-container relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded hover:bg-muted ${showEmojiPicker ? 'bg-muted' : ''}`}
              title="Insert Emoji"
            >
              <Smile className="w-4 h-4" />
            </button>

            {showEmojiPicker && (
              <div className="absolute top-full left-0 z-50 mt-1 bg-background">
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={350}
                  height={400}
                />
              </div>
            )}
          </div>

          {/* <button
            type="button"
            className="p-2 rounded hover:bg-muted opacity-50"
            title="Paragraph Format (Coming Soon)"
            disabled
          >
            <Pilcrow className="w-4 h-4" />
          </button> */}

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
        </div>

        <EditorContent
          editor={editor}
          className="min-h-[300px] w-full p-3 text-sm break-words whitespace-pre-wrap [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:overflow-x-auto focus:outline-none"
        />
    </div>
  );
});

export default RichTextEditor;
