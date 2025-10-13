'use client';

import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
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
  Link2 as LinkIcon,
  Image as ImageIcon,
  Video,
  File,
  Undo,
  Redo,
  X,
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
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        allowBase64: true,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        breaks: false,
        transformPastedText: true,
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
          'prose prose-sm max-w-none focus:outline-none min-h-[100px] w-full ' +
          'prose-ul:list-disc prose-ol:list-decimal prose-li:ml-6',
      },
     handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        const pastedText = clipboardData?.getData('text/plain');

        if (!pastedText) return false;

        const looksLikeMarkdown = /^#+\s|^\*\s|^-\s|^\d+\.\s|^\[.*\]\(.*\)|^>|```/.test(pastedText) ||
                                 pastedText.includes('\n#') ||
                                 pastedText.includes('**') ||
                                 pastedText.includes('__') ||
                                 pastedText.includes('[') && pastedText.includes('](');

        if (!looksLikeMarkdown) return false;

        event.preventDefault();

        if (!editor) return false;

        try {
          const tempDiv = document.createElement('div');
          editor.commands.insertContent(pastedText);
          
          return true;
        } catch (error) {
          console.error('Markdown paste failed:', error);
          editor.commands.insertContent(pastedText);
          return true;
        }
      },
    },
    immediatelyRender: false,
  });

  const onEmojiClick = (emojiData: EmojiClickData) => {
    editor?.commands.insertContent(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const addLink = () => {
    if (linkUrl) {
      editor?.commands.setLink({ href: linkUrl });
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor?.commands.unsetLink();
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      editor?.commands.setImage({ src: result });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      editor?.commands.insertContent(`
        <div class="video-container my-4" contenteditable="false">
          <video controls class="max-w-full rounded-lg border">
            <source src="${result}" type="${file.type}">
            Your browser does not support the video tag.
          </video>
          <p class="text-xs text-gray-500 mt-1">${file.name}</p>
        </div>
      `);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (file.type.startsWith('image/')) {
        editor?.commands.setImage({ src: result });
      } else {
        const fileName = file.name;
        editor?.commands.insertContent(`
          <div class="file-attachment my-2" contenteditable="false">
            <a href="${result}" download="${fileName}" class="flex items-center gap-2 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <File className="w-4 h-4" />
              <span class="text-sm font-medium">${fileName}</span>
              <span class="text-xs text-gray-500 ml-auto">${formatFileSize(file.size)}</span>
            </a>
          </div>
        `);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = ''; 
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const handleUndo = () => {
    editor?.commands.undo();
  };
  const handleRedo = () => {
    editor?.commands.redo();
  };
  useImperativeHandle(ref, () => ({
    getMarkdown: () => {
      if (!editor) return '';
      return (editor.storage as any).markdown.getMarkdown();
    },
    undo: () => editor?.commands.undo(),
    redo: () => editor?.commands.redo(),
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
      if (showLinkInput && !target.closest('.link-input-container')) {
        setShowLinkInput(false);
        setLinkUrl('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside as any);
    return () => document.removeEventListener('mousedown', handleClickOutside as any);
  }, [showEmojiPicker, showLinkInput]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        if (event.shiftKey) {
          event.preventDefault();
          handleRedo();
        } else {
          event.preventDefault();
          handleUndo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  if (!mounted) {
    return (
      <div className="relative w-full rounded-md border border-border bg-background transition-colors focus-within:border-primary-300 focus-within:ring-primary-300/20 focus-within:ring-1 focus-within:outline-none hover:border-primary-300">
        <div className="absolute top-2 left-2 right-2 z-10 bg-white border border-border/60 rounded-md shadow-sm p-1">
          <div className="flex flex-wrap items-center gap-1">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
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
    <div className="border-border bg-background placeholder:text-muted-foreground/60 focus-within:border-primary-300 focus-within:ring-primary-300/20 hover:border-primary-300 relative w-full rounded-md border px-3 py-6 text-base leading-none transition-colors focus-within:ring-1 focus-within:outline-none">
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
        <div className="link-input-container relative">
          <button
            type="button"
            onClick={() => setShowLinkInput(!showLinkInput)}
            className={`p-2 rounded hover:bg-muted ${editor.isActive('link') ? 'bg-muted' : ''}`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {showLinkInput && (
            <div className="absolute top-full left-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg p-3 min-w-64">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL"
                  className="flex-1 px-2 py-1 border border-border rounded text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addLink()}
                />
                <button
                  onClick={addLink}
                  className="px-2 py-1 bg-primary-base text-white-500 rounded text-sm"
                >
                  Add
                </button>
              </div>
              {editor.isActive('link') && (
                <button
                  onClick={removeLink}
                  className="flex items-center gap-1 px-2 py-1 text-primary-base text-sm rounded"
                >
                  <X className="w-3 h-3" />
                  Remove Link
                </button>
              )}
            </div>
          )}
        </div>
          <input
            type="file"
            id="image-upload"
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
          />
          <label
            htmlFor="image-upload"
            className="p-2 rounded hover:bg-muted cursor-pointer text-neutral"
            title="Upload Image"
          >
            <ImageIcon className="w-4 h-4" />
          </label>
          <input
            type="file"
            id="video-upload"
            onChange={handleVideoUpload}
            className="hidden"
            accept="video/*"
          />
          <label
            htmlFor="video-upload"
            className="p-2 rounded hover:bg-muted cursor-pointer"
            title="Upload Video"
          >
            <Video className="w-4 h-4" />
          </label>
          <input
            type="file"
            id="file-upload"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          <label
            htmlFor="file-upload"
            className="p-2 rounded hover:bg-muted cursor-pointer"
            title="Upload Document"
          >
            <File className="w-4 h-4" />
          </label>
        <button
          type="button"
          onClick={handleUndo}
          disabled={!editor.can().undo()}
          className={`p-2 rounded hover:bg-muted ${
            !editor.can().undo() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleRedo}
          disabled={!editor.can().redo()}
          className={`p-2 rounded hover:bg-muted ${
            !editor.can().redo() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[120px] w-full p-3 text-sm break-words whitespace-pre-wrap [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:overflow-x-auto focus:outline-none"
      />
    </div>
  );
});

export default RichTextEditor;