import { GenericJsxEditor } from "@mdxeditor/editor";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode } from "lexical";
import React, { useCallback } from "react";
import ButtonForDelete from "./ButtonForDelete";

const GenericRutubeBlockJsxEditorWithDelete = (
  props: React.ComponentProps<typeof GenericJsxEditor>
) => {
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

  return (
    <div style={{ 
      position: "relative", 
      display: "inline-block",
      margin: "8px 0",
      padding: "8px",
      border: "1px dashed transparent",
    }}>
      <GenericJsxEditor {...props} />
      
      <ButtonForDelete handleDelete={handleDelete} />
    </div>
  );
};

export default GenericRutubeBlockJsxEditorWithDelete