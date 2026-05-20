import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MDXEditor,
  useMdastNodeUpdater,
} from "@mdxeditor/editor";
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import { plugins } from "../../consts/plugins";
import { jsxComponentDescriptors } from "../../consts/jsxComponentDescriptors";
import { toMarkdown } from 'mdast-util-to-markdown';
import { mdxToMarkdown } from 'mdast-util-mdx';
import ReactMarkdown from 'react-markdown';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { mdxjs } from 'micromark-extension-mdxjs';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getNearestNodeFromDOMNode } from 'lexical';
import ButtonForDelete from '../../HelpComponents/ButtonForDelete';

const parseMarkdownToMdast = (markdown: string) => {
  try {
    const tree = fromMarkdown(markdown, {
      extensions: [mdxjs()],
      mdastExtensions: [mdxFromMarkdown()],
    });
    return tree.children;
  } catch (error) {
    console.error('Error parsing markdown to MDAST:', error);
    return [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: markdown,
          },
        ],
      },
    ];
  }
};

const ColumnsArticleEditor = ({ mdastNode }: { mdastNode: MdxJsxTextElement | MdxJsxFlowElement; }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const editorRef = useRef(null);
  const updateMdastNode = useMdastNodeUpdater();

  const currentTitle =
    (mdastNode.attributes?.find(
      (attr): attr is MdxJsxAttribute =>
        attr.type === "mdxJsxAttribute" && attr.name === "title"
    )?.value as string) || "";

  const getCurrentContent = () => {
    try {
      if (mdastNode.children.length === 1 && mdastNode.children[0].type === 'mdxFlowExpression') {
        return mdastNode.children[0].value;
      }
      return toMarkdown(
        { type: 'root', children: mdastNode.children },
        {
          extensions: [mdxToMarkdown()],
        }
      ).trim();
    } catch (e) {
      console.error('Error getting current content:', e);
      return '';
    }
  };

  useEffect(() => {
    setEditorContent(getCurrentContent());
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMdastNode({
      ...mdastNode,
      attributes: [
        ...(mdastNode.attributes?.filter(
          (attr) => attr.type !== "mdxJsxAttribute" || attr.name !== "title"
        ) || []),
        {
          type: "mdxJsxAttribute",
          name: "title",
          value: e.target.value,
        } as MdxJsxAttribute,
      ],
    } as MdxJsxFlowElement);
  };

  const handleContentChange = (content: string) => {
    setEditorContent(content);
  };

  const saveChanges = async () => {
    try {
      const parsedChildren = await parseMarkdownToMdast(editorContent);
      
      const newNode: MdxJsxFlowElement = {
        ...mdastNode,
        type: "mdxJsxFlowElement",
        //@ts-ignore
        children: parsedChildren
      };
  
      updateMdastNode(newNode);
      setIsEditMode(false);
    } catch (e) {
      console.error('Error saving changes:', e);
      const newNode: MdxJsxFlowElement = {
        ...mdastNode,
        type: "mdxJsxFlowElement",
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: editorContent,
              }
            ]
          }
        ]
      };
      updateMdastNode(newNode);
      setIsEditMode(false);
    }
  };

  const [editor] = useLexicalComposerContext();
  
    const handleDelete = useCallback((e: React.MouseEvent) => {
      editor.update(() => {
        const target = e.currentTarget.parentElement;
        if (!target) return;
  
        const node = $getNearestNodeFromDOMNode(target);
        if (node) {
          node.remove();
        }
      });
    }, [editor]);

  const currentContent = getCurrentContent();

  return (
    <div style={{ 
      border: "1px solid black", 
      padding: 8, 
      margin: 8, 
      position: 'relative',
      backgroundColor: '#f9f9f9'
    }}>
      <ButtonForDelete handleDelete={handleDelete} />
      <div>
        <label htmlFor="head">Заголовок:</label>
        <input
          id="head"
          style={{ 
            border: "1px solid #ddd", 
            padding: 8, 
            margin: 8,
            borderRadius: 4,
            width: 'calc(100% - 32px)'
          }}
          type="text"
          value={currentTitle}
          onChange={handleTitleChange}
        />
      </div>

      {isEditMode ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <MDXEditor
              markdown={editorContent}
              onChange={handleContentChange}
              contentEditableClassName="prose"
              plugins={plugins(jsxComponentDescriptors, true)}
              ref={editorRef}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              style={{ 
                padding: '8px 16px',
                background: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={saveChanges}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#0070f3', 
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Сохранить
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            style={{ 
              padding: '8px 16px', 
              marginBottom: 8, 
              cursor: 'pointer',
              background: '#f0f0f0',
              border: '1px solid #ddd',
              borderRadius: 4
            }}
          >
            Редактировать содержимое
          </button>
          <div 
            style={{ 
              border: "1px dashed #ccc", 
              padding: 16, 
              margin: 8,
              minHeight: 50,
              borderRadius: 4,
              background: 'white'
            }}
          >
            <ReactMarkdown>{currentContent}</ReactMarkdown>
          </div>
        </>
      )}
    </div>
  );
};

export default ColumnsArticleEditor;