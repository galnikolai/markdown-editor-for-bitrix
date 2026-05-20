"use client";
import "@mdxeditor/editor/style.css";
import {
  MDXEditor,
  JsxComponentDescriptor,
  MDXEditorMethods,
} from "@mdxeditor/editor";
import { memo, useContext, useEffect, useRef, useState, useCallback } from "react";
import { DopImgSrcGlobalContext } from "../contexts/DopImgSrcProvider";
import { plugins } from "../consts/plugins";

const MDXEditorWrapper = memo(
    ({
       onChange,
       jsxComponentDescriptors,
       imgSrc,
       startContent,
     }: {
      jsxComponentDescriptors: JsxComponentDescriptor[];
      onChange: (markdown: string) => void;
      imgSrc?: string;
      startContent?: string;
    }) => {
      const { setDopSrcGlobal } = useContext(DopImgSrcGlobalContext);
      const editorRef = useRef<MDXEditorMethods>(null);
      const [internalContent, setInternalContent] = useState<string>(startContent || "");
      const lastSavedContent = useRef<string>(startContent || "");
      //const isControlled = useRef(false);

      useEffect(() => {
        setDopSrcGlobal(imgSrc ?? "");
      }, [imgSrc]);

      useEffect(() => {
        // Синхронизируем внешнее изменение контента
        if (startContent !== lastSavedContent.current) {
          setInternalContent(startContent || "");
          lastSavedContent.current = startContent || "";
        }
      }, [startContent]);

      const handleChange = useCallback((markdown: string) => {
        setInternalContent(markdown);

        // Дебаунсим вызов onChange
        if (onChange) {
          onChange(markdown);
          lastSavedContent.current = markdown;
        }
      }, [onChange]);

      return (
          <MDXEditor
              ref={editorRef}
              markdown={internalContent}
              onChange={handleChange}
              plugins={plugins(jsxComponentDescriptors)}
              contentEditableClassName="mdx-editor"
          />
      );
    }
);

export default MDXEditorWrapper;